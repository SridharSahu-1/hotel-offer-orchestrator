import { HotelOffer } from './types';

export const supplierAHotels: HotelOffer[] = [
  { hotelId: 'a1', name: 'Holtin', price: 6000, city: 'delhi', supplier: 'Supplier A', commissionPct: 10 },
  { hotelId: 'a2', name: 'Radison', price: 5900, city: 'delhi', supplier: 'Supplier A', commissionPct: 13 },
  { hotelId: 'a3', name: 'Taj View', price: 7000, city: 'delhi', supplier: 'Supplier A', commissionPct: 12 },
];

export const supplierBHotels: HotelOffer[] = [
  { hotelId: 'b1', name: 'Holtin', price: 5340, city: 'delhi', supplier: 'Supplier B', commissionPct: 20 },
  { hotelId: 'b2', name: 'Radison', price: 6200, city: 'delhi', supplier: 'Supplier B', commissionPct: 11 },
  { hotelId: 'b3', name: 'City Palace', price: 4800, city: 'delhi', supplier: 'Supplier B', commissionPct: 15 },
];

export function hotelsForCity(hotels: HotelOffer[], city: string): HotelOffer[] {
  return hotels.filter((hotel) => hotel.city.toLowerCase() === city.trim().toLowerCase());
}
