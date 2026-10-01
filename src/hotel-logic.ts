import { HotelOffer } from './types';

export function normalizeHotelName(name: string): string {
  return name.trim().toLowerCase();
}

export function selectBestOffers(offers: HotelOffer[]): HotelOffer[] {
  const selected = new Map<string, HotelOffer>();

  for (const offer of offers) {
    const key = normalizeHotelName(offer.name);
    const current = selected.get(key);
    if (!current || offer.price < current.price || (offer.price === current.price && offer.supplier === 'Supplier A')) {
      selected.set(key, offer);
    }
  }

  return [...selected.values()].sort((a, b) => a.name.localeCompare(b.name));
}
