export type SupplierName = 'Supplier A' | 'Supplier B';

export type HotelOffer = {
  hotelId: string;
  name: string;
  price: number;
  city: string;
  supplier: SupplierName;
  commissionPct: number;
};

export type WorkflowInput = {
  city: string;
  minPrice?: number;
  maxPrice?: number;
};
