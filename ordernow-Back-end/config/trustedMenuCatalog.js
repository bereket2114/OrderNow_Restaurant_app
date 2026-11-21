// Server-owned fallback catalog for the built-in menu displayed by the storefront.
// Keep IDs and prices aligned with INITIAL_FOOD_MENUS and PERMANENT_BEVERAGES in the frontend.
// Client-submitted prices are never used for checkout calculations.
const items = [
    {
        id: '673a1001a1b2c3d4e5f60001',
        DishName: 'Awaze Rosemary Derek Tibs',
        Price: 480,
        ImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85'
    },
    {
        id: '673a1001a1b2c3d4e5f60002',
        DishName: 'Royal Addis Beyaynetu Platter',
        Price: 650,
        ImageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85'
    },
    {
        id: '673a1001a1b2c3d4e5f60003',
        DishName: 'Shiro Tegamino with Spiced Butter',
        Price: 280,
        ImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85'
    },
    {
        id: '673a1001a1b2c3d4e5f60004',
        DishName: 'Special Kurt Raw Meat Platter',
        Price: 850,
        ImageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=900&q=85'
    },
    {
        id: 'bev-ambo-water',
        DishName: 'Chilled Ambo Sparkling Mineral Water',
        Price: 65,
        ImageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=900&q=85'
    },
    {
        id: 'bev-fresh-espris',
        DishName: 'Fresh Avocado & Mango Espris Juice',
        Price: 160,
        ImageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85'
    },
    {
        id: 'bev-coca-cola',
        DishName: 'Ice-Cold Glass Bottle Coca-Cola',
        Price: 70,
        ImageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=900&q=85'
    },
    {
        id: 'bev-spiced-tej',
        DishName: 'Spiced Honey Tej & Ginger Spritz (Non-Alcoholic)',
        Price: 140,
        ImageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85'
    },
    {
        id: 'bev-hibiscus-tea',
        DishName: 'Karkadeh Hibiscus & Clove Iced Tea',
        Price: 110,
        ImageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85'
    },
    {
        id: 'bev-addis-macchiato',
        DishName: 'Roasted Yirgacheffe Double Macchiato',
        Price: 95,
        ImageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=900&q=85'
    }
]

module.exports = new Map(items.map((item) => [item.id, item]))
