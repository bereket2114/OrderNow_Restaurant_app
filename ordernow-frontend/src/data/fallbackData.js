// Food menu fallbacks have intentionally been removed.
// Food dishes must come from the backend MongoDB API. Only the permanent
// beverage catalog defined in App.jsx remains static by design.
export const API_BASE_URL = String(import.meta.env.VITE_API_URL || '').trim()
  || (import.meta.env.DEV ? 'http://localhost:5000' : '')

export const CATEGORIES = [
  'All',
  'Tibs & Sizzlers',
  'Traditional Platter (Beyaynetu)',
  'Fastin (Vegetable / Lenten)',
  'Raw Meats (Kurt / Special)',
  'Beverages & Drinks'
]

// Kept as an empty export for compatibility with any older imports.
export const INITIAL_MENUS = []
