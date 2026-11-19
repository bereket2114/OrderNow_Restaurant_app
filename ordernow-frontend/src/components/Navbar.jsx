import React from 'react';
import { Utensils, ShoppingBag, ChefHat, CheckCircle2, Wifi, WifiOff } from 'lucide-react';

export default function Navbar({
  activeView,
  setActiveView,
  cartCount,
  cartTotal,
  onOpenCart,
  activeOrder,
  paidOrdersCount,
  isBackendLive
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6DEC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <div
          onClick={() => setActiveView('storefront')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-[#1C1613] text-[#FAF7F2] flex items-center justify-center shadow-sm group-hover:bg-[#D94E28] transition-colors">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1C1613]">
                OrderNow
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#F2ECE1] text-[#D94E28] border border-[#E6DEC8]">
                Addis Kitchen
              </span>
            </div>
            <p className="text-xs text-[#8C827A] hidden sm:block">
              Ethiopian Platter & Artisanal Pasta Fusion
            </p>
          </div>
        </div>

        {/* Navigation Switcher */}
        <nav className="flex items-center gap-1.5 bg-[#F2ECE1] p-1.5 rounded-full border border-[#E6DEC8]">
          <button
            onClick={() => setActiveView('storefront')}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'storefront'
                ? 'bg-[#1C1613] text-[#FAF7F2] shadow-sm'
                : 'text-[#5C534E] hover:text-[#1C1613]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Menu Browser</span>
          </button>

          {activeOrder && (
            <button
              onClick={() => setActiveView('tracker')}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeView === 'tracker'
                  ? 'bg-[#00A859] text-white shadow-sm'
                  : 'text-[#00A859] hover:bg-[#00A859]/10'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Track Order</span>
            </button>
          )}

          <button
            onClick={() => setActiveView('staff')}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'staff'
                ? 'bg-[#D94E28] text-white shadow-sm'
                : 'text-[#5C534E] hover:text-[#1C1613]'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Staff Dashboard</span>
            {paidOrdersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-mono bg-[#1C1613] text-[#FAF7F2]">
                {paidOrdersCount}
              </span>
            )}
          </button>
        </nav>

        {/* Connection Status & Cart Trigger */}
        <div className="flex items-center gap-3">
          <div
            title={isBackendLive ? 'Connected to Express Backend :5000' : 'Preview Mode (Local State)'}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F2ECE1] border border-[#E6DEC8] text-[#5C534E]"
          >
            {isBackendLive ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#00A859]" />
                <span>API Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Demo Mode</span>
              </>
            )}
          </div>

          <button
            onClick={onOpenCart}
            className="relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#1C1613] hover:bg-[#D94E28] text-[#FAF7F2] text-sm font-semibold transition-all active:scale-95 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="font-mono tabular-nums">{cartCount}</span>
            {cartTotal > 0 && (
              <span className="hidden sm:inline font-mono text-xs pl-2 border-l border-white/20 tabular-nums">
                ETB {cartTotal.toLocaleString()}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}