import React from 'react';
import { CheckCircle2, Clock, ChefHat, PackageCheck, ArrowLeft } from 'lucide-react';

const STEPS = ['Pending Kitchen', 'Preparing', 'Ready', 'Completed'];

export default function OrderTracker({ order, onBackToMenu, onGoToStaff }) {
  if (!order) return null;

  const currentStepIndex = Math.max(0, STEPS.indexOf(order.OrderStatus));

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#E6DEC8] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DEC8] pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00A859]/15 text-[#00A859]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Chapa Payment Verified ({order.PaymentStatus})
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#1C1613] mt-2">
              Order Sent to Staff Kitchen!
            </h2>
            <p className="font-mono text-xs text-[#8C827A] mt-0.5">
              Transaction Ref: {order.tx_ref}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#8C827A] block">Total Paid via Chapa</span>
            <span className="font-mono text-2xl font-bold text-[#00A859] tabular-nums">
              ETB {Number(order.TotalAmount).toLocaleString()}.00
            </span>
          </div>
        </div>

        {/* 4-Step Kitchen Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STEPS.map((step, idx) => {
            const isDone = idx <= currentStepIndex;
            return (
              <div
                key={step}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  isDone
                    ? 'bg-[#1C1613] text-[#FAF7F2] border-[#1C1613]'
                    : 'bg-[#FAF7F2] text-[#8C827A] border-[#E6DEC8]'
                }`}
              >
                <div className="text-xs font-mono opacity-75">Step 0{idx + 1}</div>
                <div className="text-xs sm:text-sm font-bold mt-1">{step}</div>
              </div>
            );
          })}
        </div>

        {/* Itemized Dishes */}
        <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E6DEC8] space-y-3">
          <h3 className="font-serif text-base font-bold text-[#1C1613]">
            Dishes Sent to Kitchen ({order.CustomerName})
          </h3>
          <div className="divide-y divide-[#E6DEC8]">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <span className="font-mono font-bold text-[#D94E28] mr-2">
                    {item.Quantity}×
                  </span>
                  <span className="font-semibold text-[#1C1613]">{item.DishName}</span>
                </div>
                <span className="font-mono font-semibold text-[#1C1613] tabular-nums">
                  ETB {(item.UnitPrice * item.Quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          {order.Message && (
            <p className="text-xs text-[#5C534E] bg-[#FFFDF9] p-3 rounded-xl border border-[#E6DEC8]">
              <strong>Kitchen Note:</strong> {order.Message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={onBackToMenu}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E6DEC8] text-xs sm:text-sm font-semibold text-[#1C1613] hover:bg-[#F2ECE1]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu Browser</span>
          </button>

          <button
            onClick={onGoToStaff}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D94E28] hover:bg-[#B83D1B] text-white text-xs sm:text-sm font-semibold shadow-sm"
          >
            <ChefHat className="w-4 h-4" />
            <span>View Order in Staff Dashboard →</span>
          </button>
        </div>
      </div>
    </div>
  );
}