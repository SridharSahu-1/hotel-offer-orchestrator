import { HotelOffer } from './types';
import { supplierAHotels, supplierBHotels, hotelsForCity } from './supplier-data';
import { filterOffers, saveOffers } from './redis';

const baseUrl = process.env.SUPPLIER_BASE_URL ?? 'http://localhost:3000';

async function fetchSupplier(path: string, city: string): Promise<HotelOffer[]> {
  const url = `${baseUrl}${path}?city=${encodeURIComponent(city)}`;
  console.log(`Calling supplier: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
    return response.json() as Promise<HotelOffer[]>;
  } catch (error) {
    console.error(`Supplier request failed: ${path}`, error);
    throw error;
  }
}

export async function fetchSupplierA(city: string): Promise<HotelOffer[]> {
  return fetchSupplier('/supplierA/hotels', city);
}

export async function fetchSupplierB(city: string): Promise<HotelOffer[]> {
  return fetchSupplier('/supplierB/hotels', city);
}

export async function persistOffers(city: string, offers: HotelOffer[]): Promise<void> {
  await saveOffers(city, offers);
}

export async function readFilteredOffers(city: string, minPrice?: number, maxPrice?: number): Promise<HotelOffer[]> {
  return filterOffers(city, minPrice, maxPrice);
}

export async function checkSupplierA(city: string): Promise<boolean> {
  return hotelsForCity(supplierAHotels, city).length >= 0;
}

export async function checkSupplierB(city: string): Promise<boolean> {
  return hotelsForCity(supplierBHotels, city).length >= 0;
}
