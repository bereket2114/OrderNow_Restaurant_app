// Category labels used by the staff menu form. Food menu records are fetched only from MongoDB.
// Do not add sample/demo food dishes to this file.
export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export const CATEGORIES = [
  'All',
  'Tibs & Sizzlers',
  'Traditional Platter (Beyaynetu)',
  'Fastin (Vegetable / Lenten)',
  'Raw Meats (Kurt / Special)',
  'Beverages & Drinks'
];
