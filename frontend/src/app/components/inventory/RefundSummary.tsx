'use client';

export interface RefundSummaryItem {
  productName: string;
  price: number;
  quantity: number;
}

interface RefundSummaryProps {
  items: RefundSummaryItem[];
  refundMethod?: {
    type: string;
    last4?: string;
  };
  onProcessRefund?: () => void;
}

export default function RefundSummary({
  items,
  refundMethod,
  onProcessRefund,
}: RefundSummaryProps) {
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const total = calculateTotal();

  return (
    <div className="bg-[#b8d4e8] rounded-lg p-6 min-w-[320px]">
      <h3 className="text-[#2d4a5c] font-semibold text-xl mb-6">Refund summary</h3>

      <div className="space-y-3 mb-6">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{item.productName}</span>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{item.price.toFixed(2)}</span>
              <span className="text-gray-700 w-6 text-right">{item.quantity}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-400 pt-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-[#2d4a5c] font-semibold text-lg">Refund Total</span>
          <span className="text-[#2d4a5c] font-bold text-xl">
            ₦ {total.toFixed(2)}
          </span>
        </div>
      </div>

      {refundMethod && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-700 font-medium">Refund method</span>
          </div>
          <div className="bg-white rounded px-4 py-2 flex items-center justify-between">
            <span className="text-sm text-gray-700">{refundMethod.type}</span>
            {refundMethod.last4 && (
              <span className="text-sm text-gray-500">****{refundMethod.last4}</span>
            )}
          </div>
        </div>
      )}

      <button
        onClick={onProcessRefund}
        disabled={items.length === 0}
        className={`
          w-full py-3 rounded-lg font-semibold text-[#2d4a5c]
          transition-all
          ${
            items.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#c8e6d4] hover:bg-[#b5dcc5]'
          }
        `}
      >
        Process Refund
      </button>
    </div>
  );
}
