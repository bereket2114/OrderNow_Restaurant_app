# OrderNow — Senior UI/UX Design System & Style Guide (`style.md`)

## 1. Aesthetic Direction: "Artisanal Bistro & Warm Hospitality"
- **The Vibe**: The application should evoke the feeling of walking into a modern, high-end bistro. It must look delicious, tactile, and highly professional.
- **Anti-AI-Slop Rules**:
  - ABSOLUTELY NO generic neon purple, blue, or vibrant gradient SaaS aesthetics.
  - NO sterile, hospital-white (`#FFFFFF`) or flat gray backgrounds.
  - NO robotic, perfectly symmetrical, or overly playful UI elements that look generated.
  - The design must feel crafted by a human expert in restaurant UX.

## 2. The Restaurant Color Palette
We are using a palette inspired by food, spices, and warm dining environments.
- **Base / Canvas**: Warm Dough (`#F9F6F0`) — A soft, appetizing off-white for the main background.
- **Surface / Cards**: Crisp Cream (`#FFFEFC`) — For menu cards and elevated elements.
- **Primary Ink (Headings & Bold Text)**: Roasted Espresso (`#2C241B`) — Deep, rich, and grounding.
- **Secondary Ink (Descriptions)**: Truffle Gray (`#6B635A`) — Muted but legible.
- **Primary Brand Accent**: Terracotta Spice (`#D84C27`) — Appetizing, energetic orange-red for primary actions (Add to Cart). Hover: `#B73D1E`.
- **Secondary Accent / Highlight**: Mustard Seed (`#EBB134`) — For subtle highlights or "Popular" badges.
- **Success & Payment (Chapa)**: Fresh Herb Green (`#10A352`) — For successful payments and the Chapa button. Hover: `#0D8A45`.
- **Borders & Dividers**: Oat Milk (`#E8E3DA`) — Subtle, warm separation.

## 3. Typography: The Editorial Menu Look
- **Display & Dish Titles (`font-serif`)**: `'Playfair Display', 'Merriweather', serif`
  - Use for the Logo, Page Headers, and Dish Names. This brings an elegant, classic restaurant menu feel.
  - Weights: `600`, `700`.
- **UI & Body Copy (`font-sans`)**: `'Inter', -apple-system, sans-serif`
  - Use for buttons, navigation, and ingredient descriptions. Clean, highly readable, modern.
  - Weights: `400`, `500`, `600`.
- **Prices, Quantities & Receipts (`font-mono`)**: `'JetBrains Mono', 'Fira Code', monospace`
  - Use *only* for numbers (Prices, Item Quantities, Order IDs). It adds a receipt-like, utilitarian precision to the financial data.
  - Add `tabular-nums` CSS utility to prevent shifting.

## 4. Layout, Components & Micro-Interactions
- **Shadows**: Use very soft, diffused, warm-tinted shadows (e.g., `box-shadow: 0 10px 25px -5px rgba(44, 36, 27, 0.05)`). No harsh black shadows.
- **Menu Cards**:
  - Image must be prominent (aspect ratio 4:3 or 1:1), with a subtle scale-up effect on hover (`transition-transform duration-500 hover:scale-105`).
  - Overflow must be hidden, with rounded corners (`rounded-2xl`).
- **Buttons**:
  - Must feel tactile. Active states should slightly compress (`active:scale-[0.98]`).
  - Use medium border radius (`rounded-xl` or `rounded-full`).
- **Spacing**: Generous, breathable padding. Let the food photography breathe. Use `gap-6` or `gap-8` in grids.