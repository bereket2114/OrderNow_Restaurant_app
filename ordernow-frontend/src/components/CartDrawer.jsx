import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onInitiateChapaCheckout,
  isSubmitting
}) {
  const [customer, setCustomer] = useState({
    CustomerName: '',
    CustomerPhone: '',
    CustomerEmail: '',
    DeliveryAddress: 'Takeaway / Pickup',
    Message: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const grandTotal = cart.reduce((sum, item) => sum + item.Price * item.Quantity, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer.CustomerName.trim() || !customer.CustomerPhone.trim()) {
      setError('Please enter your name and phone number for Chapa verification.');
      return;
    }
    setError('');
    onInitiateChapaCheckout(customer);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#FAF7F2] h-full flex flex-col justify-between shadow-2xl border-l border-[#E6DEC8]">
        {/* Drawer Header */}
        <div className="p-5 bg-[#FFFDF9] border-b border-[#E6DEC8] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1C1613]">Your Multi-Item Order</h2>
            <p className="text-xs text-[#8C827A]">
              Review your selected dishes & quantities before Chapa payment
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F2ECE1] text-[#5C534E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-[#F2ECE1] text-[#8C827A] flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1C1613]">Your order tray is empty</h3>
              <p className="text-sm text-[#5C534E] mt-1">
                Select dishes like 1× Pasta and 2× Chicken Fries from the menu.
              </p>
            </div>
          ) : (
            <>
              {/* Itemized List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C827A]">
                    Selected Dishes ({cart.reduce((s, i) => s + i.Quantity, 0)} items)
                  </span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-xs font-semibold text-[#C93B2B] hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="p-3.5 rounded-xl bg-[#FFFDF9] border border-[#E6DEC8] flex items-center gap-3.5"
                  >
                    <img
                      src={item.ImageUrl}
                      alt={item.DishName}
                      className="w-16 h-16 rounded-lg object-cover bg-[#F2ECE1] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-bold text-[#1C1613] truncate">
                        {item.DishName}
                      </h4>
                      <p className="font-mono text-xs text-[#8C827A] tabular-nums">
                        ETB {item.Price} × {item.Quantity} ={' '}
                        <span className="font-bold text-[#1C1613]">
                          ETB {(item.Price * item.Quantity).toLocaleString()}
                        </span>
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item._id, item.Quantity - 1)}
                          className="w-6 h-6 rounded bg-[#F2ECE1] flex items-center justify-center text-[#1C1613]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold tabular-nums">
                          {item.Quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item._id, item.Quantity + 1)}
                          className="w-6 h-6 rounded bg-[#F2ECE1] flex items-center justify-center text-[#1C1613]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item._id)}
                          className="ml-auto text-[#8C827A] hover:text-[#C93B2B]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Details Form */}
              <form id="chapa-checkout-form" onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-[#E6DEC8]">
                <h3 className="font-serif text-base font-bold text-[#1C1613]">
                  Customer & Delivery Details
                </h3>

                {error && (
                  <div className="p-3 rounded-xl bg-[#C93B2B]/10 border border-[#C93B2B]/30 text-xs font-medium text-[#C93B2B]">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#5C534E] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bereket Woldemariyam"
                    value={customer.CustomerName}
                    onChange={(e) => setCustomer({ ...customer, CustomerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D94E28]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#5C534E] mb-1">
                      Phone (Telebirr / Chapa) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0911223344"
                      value={customer.CustomerPhone}
                      onChange={(e) => setCustomer({ ...customer, CustomerPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#E6DEC8] text-sm font-mono focus:outline-none focus:border-[#D94E28]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5C534E] mb-1">
                      Email (Receipt)
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={customer.CustomerEmail}
                      onChange={(e) => setCustomer({ ...customer, CustomerEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D94E28]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C534E] mb-1">
                    Delivery Address or Pickup
                  </label>
                  <input
                    type="text"
                    value={customer.DeliveryAddress}
                    onChange={(e) => setCustomer({ ...customer, DeliveryAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D94E28]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C534E] mb-1">
                    Kitchen Note (Message)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Extra mitmita on the chicken fries, less oil on pasta..."
                    value={customer.Message}
                    onChange={(e) => setCustomer({ ...customer, Message: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D94E28]"
                  />
                </div>
              </form>
            </>
          )}
        </div>

        {/* Drawer Footer: Grand Total + Chapa Payment CTA */}
        {cart.length > 0 && (
          <div className="p-5 bg-[#FFFDF9] border-t border-[#E6DEC8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#5C534E]">Total Payment Due</span>
              <span className="font-mono text-xl font-bold text-[#1C1613] tabular-nums">
                ETB {grandTotal.toLocaleString()}.00
              </span>
            </div>

            <button
              type="submit"
              form="chapa-checkout-form"
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-xl bg-[#00A859] hover:bg-[#008F4C] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? 'Initializing Chapa...'
                  : `Pay ETB ${grandTotal.toLocaleString()} with Chapa`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}