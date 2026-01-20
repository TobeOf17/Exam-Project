'use client';

import { AlertTriangle } from 'lucide-react';

interface LowStockItem {
  barcode: string;
  productName: string;
  currentStock?: number;
}

interface LowStockAlertProps {
  items: LowStockItem[];
  onSelectItem?: (item: LowStockItem) => void;
}

export default function LowStockAlert({ items, onSelectItem }: LowStockAlertProps) {
  return (
    <div className="bg-[#b8d4e8] rounded-lg p-4 min-w-[280px]">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[#2d4a5c] font-semibold text-lg">Low stock Alerts</h3>
        <AlertTriangle size={20} className="text-orange-500" />
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-gray-600">No low stock items</p>
        ) : (
          items.map((item) => (
            <div
              key={item.barcode}
              onClick={() => onSelectItem?.(item)}
              className={`
                bg-white rounded p-3 flex items-center justify-between
                ${onSelectItem ? 'cursor-pointer hover:bg-gray-50' : ''}
              `}
            >
              <div className="flex-1">
                <p className="text-xs text-gray-500">{item.barcode}</p>
                <p className="text-sm font-medium text-[#2d4a5c]">{item.productName}</p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 cursor-pointer"
                onChange={() => onSelectItem?.(item)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
