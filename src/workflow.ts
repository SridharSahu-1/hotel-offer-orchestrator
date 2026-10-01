import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';
import { HotelOffer, WorkflowInput } from './types';
import { selectBestOffers } from './hotel-logic';

const supplierActivities = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
  retry: { maximumAttempts: 3 },
});

export async function hotelOfferWorkflow(input: WorkflowInput): Promise<HotelOffer[]> {
  let supplierA: HotelOffer[] = [];
  let supplierB: HotelOffer[] = [];
  let supplierAFailed = false;
  let supplierBFailed = false;

  const results = await Promise.allSettled([
    supplierActivities.fetchSupplierA(input.city),
    supplierActivities.fetchSupplierB(input.city),
  ]);

  if (results[0].status === 'fulfilled') supplierA = results[0].value;
  else supplierAFailed = true;
  if (results[1].status === 'fulfilled') supplierB = results[1].value;
  else supplierBFailed = true;
  if (supplierAFailed && supplierBFailed) throw new Error('Both suppliers failed');

  const bestOffers = selectBestOffers([...supplierA, ...supplierB]);
  await supplierActivities.persistOffers(input.city, bestOffers);
  return supplierActivities.readFilteredOffers(input.city, input.minPrice, input.maxPrice);
}
