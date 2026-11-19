import React, { useState } from 'react';
import { Clock, Plus, Minus, Check, ShoppingBag } from 'lucide-react';

export default function DishCard({ dish, cartItem, onAddToCart, onUpdateCartQty }) {
  const [selectedQty, setSelectedQty] = useState(1);

  const handleAdd = () => {
    onAddToCart(dish, selectedQty);
    setSelectedQty(1);
  };

  return (
    <article className="group bg-[#FFFDF9] rounded-2xl border border-[#E6DEC8] overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div>
        {/* 4:3 Food Photography Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F2ECE1]">
          <img
            src={dish.ImageUrl}
            alt={dish.DishName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1C1613]/85 text-[#FAF7F2] backdrop-blur-sm">
              {dish.Category || 'Signature'}
            </span>
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[#FFFDF9]/95 text-[#1C1613] shadow-sm tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[#D94E28]" />
              {dish.prep_time_minutes} min
            </span>
          </div>
          {cartItem && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#00A859] text-white shadow-sm">
                <Check className="w-3.5 h-3.5" />
                {cartItem.Quantity}× in Order
              </span>
            </div>
          )}
        </div>

        {/* Dish Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-serif text-lg font-bold text-[#1C1613] leading-snug">
              {dish.DishName}
            </h3>
            <span className="font-mono text-base font-bold text-[#D94E28] shrink-0 tabular-nums">
              ETB {Number(dish.Price).toLocaleString()}
            </span>
          </div>

          {/* Ingredients Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(dish.Ingredients || []).map((ingredient, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md text-xs bg-[#F2ECE1] text-[#5C534E] border border-[#E6DEC8]/70"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer: Quantity Selector + Add to Order */}
      <div className="px-5 pb-5 pt-3 border-t border-[#E6DEC8]/60 flex items-center justify-between gap-3">
        {cartItem ? (
          <div className="w-full flex items-center justify-between bg-[#F2ECE1] p-1.5 rounded-xl border border-[#E6DEC8]">
            <span className="text-xs font-semibold text-[#5C534E] pl-2.5">
              Selected Qty ({cartItem.Quantity}×)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateCartQty(dish._id, cartItem.Quantity - 1)}
                className="w-8 h-8 rounded-lg bg-[#FFFDF9] hover:bg-[#1C1613] hover:text-white text-[#1C1613] flex items-center justify-center border border-[#E6DEC8] transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-sm font-bold w-6 text-center tabular-nums">
                {cartItem.Quantity}
              </span>
              <button
                onClick={() => onUpdateCartQty(dish._id, cartItem.Quantity + 1)}
                className="w-8 h-8 rounded-lg bg-[#D94E28] text-white flex items-center justify-center hover:bg-[#B83D1B] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center bg-[#F2ECE1] rounded-xl p-1 border border-[#E6DEC8]">
              <button
                type="button"
                onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1C1613] hover:bg-[#FFFDF9] transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-sm font-bold w-7 text-center tabular-nums">
                {selectedQty}
              </span>
              <button
                type="button"
                onClick={() => setSelectedQty(selectedQty + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1C1613] hover:bg-[#FFFDF9] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#1C1613] hover:bg-[#D94E28] text-[#FAF7F2] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add {selectedQty > 1 ? `${selectedQty}× ` : ''}to Order</span>
            </button>
          </>
        )}
      </div>
    </article>
  );
}