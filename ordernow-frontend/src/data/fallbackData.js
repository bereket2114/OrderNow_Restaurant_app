export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const CATEGORIES = [
  'All',
  'Pasta & Fusion',
  'Crispy Sides & Fries',
  'Ethiopian Platters',
  'Artisanal Drinks'
];

export const INITIAL_MENUS = [
  {
    _id: '673a1001a1b2c3d4e5f60001',
    DishName: 'Artisanal Berbere Beef Tagliatelle (Pasta)',
    Price: 420,
    Category: 'Pasta & Fusion',
    ImageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 18,
    Ingredients: ['Fresh Egg Tagliatelle', 'Slow-Braised Beef Ragù', 'Awaze Reduction', 'Aged Parmigiano', 'Fresh Basil'],
    IsAvailable: true
  },
  {
    _id: '673a1001a1b2c3d4e5f60002',
    DishName: 'Crispy Mitmita Chicken Fries',
    Price: 340,
    Category: 'Crispy Sides & Fries',
    ImageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 14,
    Ingredients: ['Free-Range Chicken Tenders', 'Hand-Cut Crispy Potatoes', 'Mitmita Spice Dust', 'Roasted Garlic Aioli'],
    IsAvailable: true
  },
  {
    _id: '673a1001a1b2c3d4e5f60003',
    DishName: 'Creamy Kibbeh & Roasted Garlic Fettuccine',
    Price: 390,
    Category: 'Pasta & Fusion',
    ImageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 15,
    Ingredients: ['Artisanal Fettuccine', 'Spiced Niter Kibbeh Cream', 'Charred Cherry Tomatoes', 'Korerima'],
    IsAvailable: true
  },
  {
    _id: '673a1001a1b2c3d4e5f60004',
    DishName: 'Royal Addis Beyaynetu & Tibs Platter',
    Price: 680,
    Category: 'Ethiopian Platters',
    ImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 25,
    Ingredients: ['100% Teff Injera', 'Sizzling Rosemary Derek Tibs', 'Misir Wot', 'Shiro Tegamino', 'Ayib Cheese'],
    IsAvailable: true
  },
  {
    _id: '673a1001a1b2c3d4e5f60005',
    DishName: 'Spiced Honey Tej & Ginger Spritz',
    Price: 160,
    Category: 'Artisanal Drinks',
    ImageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85',
    prep_time_minutes: 5,
    Ingredients: ['Wildflower Honey', 'Fresh Pressed Ginger', 'Sparkling Spring Water', 'Lime Zest'],
    IsAvailable: true
  }
];