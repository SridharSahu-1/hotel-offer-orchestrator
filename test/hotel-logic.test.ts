import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectBestOffers } from '../src/hotel-logic';
import { HotelOffer } from '../src/types';

const offer = (name: string, price: number, supplier: 'Supplier A' | 'Supplier B'): HotelOffer => ({
  hotelId: `${supplier}-${name}`,
  name,
  price,
  city: 'delhi',
  supplier,
  commissionPct: 10,
});

test('selects the cheaper offer and keeps unique hotels', () => {
  const result = selectBestOffers([
    offer('Holtin', 6000, 'Supplier A'),
    offer(' holtin ', 5340, 'Supplier B'),
    offer('Radison', 5900, 'Supplier A'),
  ]);
  assert.equal(result.length, 2);
  assert.equal(result.find((hotel) => hotel.name === ' holtin ')?.supplier, 'Supplier B');
});

test('uses Supplier A when prices are equal', () => {
  const result = selectBestOffers([offer('Holtin', 5000, 'Supplier B'), offer('Holtin', 5000, 'Supplier A')]);
  assert.equal(result[0].supplier, 'Supplier A');
});
