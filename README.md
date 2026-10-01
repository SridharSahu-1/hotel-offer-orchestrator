# Hotel Offer Orchestrator

Service for combining hotel offers from two suppliers. The selected offer for each hotel is stored in Redis and can be filtered by price.

## Run with Docker

```bash
docker compose up --build
```

The API runs on `http://localhost:3000`.

## API

```bash
curl 'http://localhost:3000/api/hotels?city=delhi'
curl 'http://localhost:3000/api/hotels?city=delhi&minPrice=5000&maxPrice=6000'
curl 'http://localhost:3000/health'
```

Supplier endpoints:

```bash
curl 'http://localhost:3000/supplierA/hotels?city=delhi'
curl 'http://localhost:3000/supplierB/hotels?city=delhi'
```

## Local development

```bash
npm install
npm run build
npm test
```

Set the values in `.env.example` when running Redis and Temporal outside Docker.

To simulate a supplier outage, set `SUPPLIER_A_DOWN=true` or `SUPPLIER_B_DOWN=true` in the application environment and restart the service.

## Postman

Import `postman/hotel-offer-orchestrator.postman_collection.json`.
