import express, { NextFunction, Request, Response } from 'express';
import { hotelOfferWorkflow } from './workflow';
import { getTemporalClient } from './temporal-client';
import { pingRedis } from './redis';
import { supplierAHotels, supplierBHotels, hotelsForCity } from './supplier-data';

const app = express();
app.use(express.json());

function parsePrice(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.trim() === '') throw new Error('Price must be a number');
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error('Price must be a non-negative number');
  return parsed;
}

app.get('/supplierA/hotels', (req, res) => {
  if (process.env.SUPPLIER_A_DOWN === 'true') return res.status(503).json({ error: 'Supplier A is unavailable' });
  return res.json(hotelsForCity(supplierAHotels, String(req.query.city ?? '')));
});

app.get('/supplierB/hotels', (req, res) => {
  if (process.env.SUPPLIER_B_DOWN === 'true') return res.status(503).json({ error: 'Supplier B is unavailable' });
  return res.json(hotelsForCity(supplierBHotels, String(req.query.city ?? '')));
});

app.get('/api/hotels', async (req, res, next) => {
  try {
    const city = String(req.query.city ?? '').trim().toLowerCase();
    if (!city) return res.status(400).json({ error: 'city is required' });
    const minPrice = parsePrice(req.query.minPrice);
    const maxPrice = parsePrice(req.query.maxPrice);
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return res.status(400).json({ error: 'minPrice cannot be greater than maxPrice' });
    }

    const client = await getTemporalClient();
    const result = await client.workflow.execute(hotelOfferWorkflow, {
      taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? 'hotel-offer-task-queue',
      workflowId: `hotel-search-${city}-${Date.now()}`,
      args: [{ city, minPrice, maxPrice }],
    });
    return res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Both suppliers failed')) {
      return res.status(503).json({ error: 'Both suppliers are unavailable' });
    }
    return next(error);
  }
});

async function checkSupplier(path: string): Promise<boolean> {
  try {
    const baseUrl = process.env.SUPPLIER_BASE_URL ?? `http://localhost:${port}`;
    const response = await fetch(`${baseUrl}${path}?city=delhi`);
    return response.ok;
  } catch {
    return false;
  }
}

app.get('/health', async (_req, res) => {
  const [redis, supplierA, supplierB] = await Promise.all([
    pingRedis(),
    checkSupplier('/supplierA/hotels'),
    checkSupplier('/supplierB/hotels'),
  ]);
  const suppliers = { supplierA, supplierB };
  const healthy = redis && suppliers.supplierA && suppliers.supplierB;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    redis: redis ? 'healthy' : 'unhealthy',
    ...suppliers,
  });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API listening on port ${port}`));
