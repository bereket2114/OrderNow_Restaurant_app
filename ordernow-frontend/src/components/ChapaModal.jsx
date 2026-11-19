import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ExternalLink, Lock } from 'lucide-react';

export default function ChapaModal({ pendingOrder, onConfirmPayment, onCancel }) {
  const [selectedMethod, setSelectedMethod] = useState('telebirr');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!pendingOrder) return null;

  const handleComplete = async () => {
    setIsVerifying(true);
    await onConfirmPayment(pendingOrder.tx_ref);
    setIsVerifying(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl border border-[#E6DEC8] overflow-hidden shadow-2xl">
        {/* Chapa Emerald Header */}
        <div className="bg-[#00A859] text-white p-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
              <Lock className="w-3.5 h-3.5" /> Chapa Secure Checkout
            </span>
            <span className="font-mono text-xs opacity-90">{pendingOrder.tx_ref}</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-sm opacity-90">Total Amount</span>
            <span className="font-mono text-2xl font-bold tabular-nums">
              ETB {Number(pendingOrder.TotalAmount).toLocaleString()}.00
            </span>
          </div>
        </div>

        {/* Itemized Summary & Payment Methods */}
        <div className="p-6 space-y-5">
          <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E6DEC8] space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8C827A] mb-1">
              Order Summary for {pendingOrder.CustomerName}
            </div>
            {pendingOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs font-medium text-[#1C1613]">
                <span>
                  {item.Quantity}× {item.DishName}
                </span>
                <span className="font-mono tabular-nums">
                  ETB {(item.UnitPrice * item.Quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C534E] mb-2">
              Select Chapa Payment Channel
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'telebirr', label: 'telebirr' },
                { id: 'cbebirr', label: 'CBE Birr' },
                { id: 'awash', label: 'AwashBirr' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    selectedMethod === m.id
                      ? 'bg-[#00A859]/10 border-[#00A859] text-[#00A859]'
                      : 'bg-[#FAF7F2] border-[#E6DEC8] text-[#5C534E]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {pendingOrder.chapaCheckoutUrl &&
            pendingOrder.chapaCheckoutUrl.startsWith('https://checkout.chapa.co') && (
              <a
                href={pendingOrder.chapaCheckoutUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F2ECE1] text-[#1C1613] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#E6DEC8]"
              >
                <span>Open Hosted Chapa Checkout Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 rounded-xl border border-[#E6DEC8] text-xs font-semibold text-[#5C534E] hover:bg-[#F2ECE1]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={isVerifying}
              className="flex-1 py-3 px-5 rounded-xl bg-[#00A859] hover:bg-[#008F4C] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isVerifying
                  ? 'Verifying & Sending to Staff...'
                  : 'Complete Chapa Payment'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}