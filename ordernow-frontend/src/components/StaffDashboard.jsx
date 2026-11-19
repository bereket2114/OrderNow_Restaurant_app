import React, { useState } from 'react';
import { ChefHat, Plus, Trash2, CheckCircle2, Clock, Upload, Utensils } from 'lucide-react';
import { CATEGORIES } from '../data/fallbackData';

const NEXT_STATUS = {
  'Pending Kitchen': 'Preparing',
  Preparing: 'Ready',
  Ready: 'Completed'
};

export default function StaffDashboard({
  orders,
  menus,
  onUpdateOrderStatus,
  onCreateMenu,
  onDeleteMenu
}) {
  const [subTab, setSubTab] = useState('kds');
  const [formData, setFormData] = useState({
    DishName: '',
    Price: '',
    Category: 'Pasta & Fusion',
    prep_time_minutes: 15,
    Ingredients: '',
    ImageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateDish = async (e) => {
    e.preventDefault();
    await onCreateMenu(formData, imageFile, imagePreview);
    setFormData({
      DishName: '',
      Price: '',
      Category: 'Pasta & Fusion',
      prep_time_minutes: 15,
      Ingredients: '',
      ImageUrl: ''
    });
    setImageFile(null);
    setImagePreview('');
    setStatusMsg('New dish published to Menu Browser!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Staff Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FFFDF9] p-5 rounded-2xl border border-[#E6DEC8]">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1C1613]">
            Staff Kitchen & Menu Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#5C534E]">
            Review Chapa-paid customer orders & publish new dishes with food photography
          </p>
        </div>

        <div className="flex gap-2 bg-[#F2ECE1] p-1.5 rounded-xl border border-[#E6DEC8]">
          <button
            onClick={() => setSubTab('kds')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              subTab === 'kds'
                ? 'bg-[#1C1613] text-white'
                : 'text-[#5C534E] hover:text-[#1C1613]'
            }`}
          >
            Kitchen Order Queue ({orders.length})
          </button>
          <button
            onClick={() => setSubTab('menu')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              subTab === 'menu'
                ? 'bg-[#D94E28] text-white'
                : 'text-[#5C534E] hover:text-[#1C1613]'
            }`}
          >
            + Post Menu & Food Image ({menus.length})
          </button>
        </div>
      </div>

      {subTab === 'kds' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.length === 0 ? (
            <div className="col-span-full bg-[#FFFDF9] p-12 rounded-2xl border border-[#E6DEC8] text-center">
              <ChefHat className="w-10 h-10 text-[#8C827A] mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-[#1C1613]">
                No Active Kitchen Orders Yet
              </h3>
              <p className="text-sm text-[#5C534E]">
                As soon as a customer finishes paying via Chapa, their order appears here.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id || order.tx_ref}
                className="bg-[#FFFDF9] rounded-2xl border border-[#E6DEC8] p-5 flex flex-col justify-between shadow-xs space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E6DEC8]">
                    <div>
                      <span className="font-serif font-bold text-base text-[#1C1613]">
                        {order.CustomerName}
                      </span>
                      <span className="block font-mono text-xs text-[#8C827A]">
                        {order.CustomerPhone} • {order.DeliveryAddress}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#00A859]/15 text-[#00A859]">
                      {order.PaymentStatus}
                    </span>
                  </div>

                  {/* Itemized Dishes List */}
                  <div className="py-3 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A]">
                      Ordered Items:
                    </div>
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-[#FAF7F2] px-3 py-2 rounded-xl border border-[#E6DEC8]"
                      >
                        <span className="text-sm font-bold text-[#1C1613]">
                          <span className="font-mono text-[#D94E28] mr-1.5">
                            {item.Quantity}×
                          </span>
                          {item.DishName}
                        </span>
                        <span className="font-mono text-xs text-[#5C534E]">
                          ETB {(item.UnitPrice * item.Quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.Message && (
                    <div className="p-2.5 rounded-xl bg-[#D97706]/10 border border-[#D97706]/30 text-xs text-[#1C1613]">
                      <strong>Note:</strong> {order.Message}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E6DEC8] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8C827A]">Current Status:</span>
                    <span className="font-bold text-[#D94E28]">{order.OrderStatus}</span>
                  </div>

                  {NEXT_STATUS[order.OrderStatus] && (
                    <button
                      onClick={() =>
                        onUpdateOrderStatus(order._id, NEXT_STATUS[order.OrderStatus])
                      }
                      className="w-full py-2.5 px-4 rounded-xl bg-[#1C1613] hover:bg-[#D94E28] text-white text-xs font-semibold transition-colors"
                    >
                      Mark as "{NEXT_STATUS[order.OrderStatus]}" →
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Menu & Image Manager */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleCreateDish}
            className="lg:col-span-5 bg-[#FFFDF9] p-6 rounded-2xl border border-[#E6DEC8] space-y-4 h-fit"
          >
            <h2 className="font-serif text-xl font-bold text-[#1C1613]">
              Post New Dish with Food Image
            </h2>

            {statusMsg && (
              <div className="p-3 rounded-xl bg-[#00A859]/15 text-[#00A859] text-xs font-bold">
                {statusMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#5C534E] mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Spicy Awaze Beef Pasta"
                value={formData.DishName}
                onChange={(e) => setFormData({ ...formData, DishName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DEC8] text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5C534E] mb-1">
                  Price (ETB) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="420"
                  value={formData.Price}
                  onChange={(e) => setFormData({ ...formData, Price: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DEC8] text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5C534E] mb-1">
                  Prep Time (1-240 min) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="240"
                  value={formData.prep_time_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, prep_time_minutes: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DEC8] text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C534E] mb-1">
                Category
              </label>
              <select
                value={formData.Category}
                onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DEC8] text-sm"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C534E] mb-1">
                Ingredients (comma-separated) *
              </label>
              <input
                type="text"
                required
                placeholder="Tagliatelle, Braised Beef, Berbere, Parmigiano"
                value={formData.Ingredients}
                onChange={(e) => setFormData({ ...formData, Ingredients: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DEC8] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C534E] mb-1">
                Upload Food Image (Multer / Cloudinary) *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-[#5C534E] file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1C1613] file:text-white hover:file:bg-[#D94E28]"
              />
              <input
                type="url"
                placeholder="Or paste direct Food Image URL..."
                value={formData.ImageUrl}
                onChange={(e) => setFormData({ ...formData, ImageUrl: e.target.value })}
                className="w-full mt-2 px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
              />
              {(imagePreview || formData.ImageUrl) && (
                <img
                  src={imagePreview || formData.ImageUrl}
                  alt="Preview"
                  className="mt-2 w-full h-36 object-cover rounded-xl border border-[#E6DEC8]"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-5 rounded-xl bg-[#D94E28] hover:bg-[#B83D1B] text-white font-semibold text-sm transition-all"
            >
              Publish Dish to Menu
            </button>
          </form>

          {/* Existing Menu List */}
          <div className="lg:col-span-7 space-y-3">
            {menus.map((m) => (
              <div
                key={m._id}
                className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#E6DEC8] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={m.ImageUrl}
                    alt={m.DishName}
                    className="w-16 h-16 rounded-xl object-cover bg-[#F2ECE1]"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#1C1613]">
                      {m.DishName}
                    </h4>
                    <p className="font-mono text-xs text-[#D94E28] font-bold">
                      ETB {m.Price} • {m.prep_time_minutes} min
                    </p>
                    <p className="text-xs text-[#8C827A] mt-0.5">
                      {(m.Ingredients || []).join(', ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteMenu(m._id)}
                  className="p-2 text-[#8C827A] hover:text-[#C93B2B]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}