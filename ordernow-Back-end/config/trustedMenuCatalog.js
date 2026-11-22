// Server-owned fixed catalog for the permanent beverages only.
// Food menu items must always be loaded from MongoDB; no demo food IDs are accepted here.
const items = [
    {
        "id": "bev-ambo-water",
        "DishName": "Chilled Ambo Sparkling Mineral Water",
        "Price": 65,
        "ImageUrl": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=900&q=85"
    },
    {
        "id": "bev-fresh-espris",
        "DishName": "Fresh Avocado & Mango Espris Juice",
        "Price": 160,
        "ImageUrl": "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85"
    },
    {
        "id": "bev-coca-cola",
        "DishName": "Ice-Cold Glass Bottle Coca-Cola",
        "Price": 70,
        "ImageUrl": "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=900&q=85"
    },
    {
        "id": "bev-spiced-tej",
        "DishName": "Spiced Honey Tej & Ginger Spritz (Non-Alcoholic)",
        "Price": 140,
        "ImageUrl": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85"
    },
    {
        "id": "bev-hibiscus-tea",
        "DishName": "Karkadeh Hibiscus & Clove Iced Tea",
        "Price": 110,
        "ImageUrl": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85"
    },
    {
        "id": "bev-addis-macchiato",
        "DishName": "Roasted Yirgacheffe Double Macchiato",
        "Price": 95,
        "ImageUrl": "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=900&q=85"
    }
]

module.exports = new Map(items.map((item) => [item.id, item]))
