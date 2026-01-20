'use client';

import { useState } from 'react';
import { Search, Minus, Plus } from 'lucide-react';

export interface RefundItem {
  id: string;
  item: string;
  productPrice: number;
  qtyPurchased: number;
  qtyToReturn: number;
  condition: 'Resellable' | 'Damaged';
  selected: boolean;
}

interface RefundItemsTableProps {
  items: RefundItem[];
  onToggleSelect?: (id: string) => void;
  onUpdateQty?: (id: string, qty: number) => void;
  onUpdateCondition?: (id: string, condition: 'Resellable' | 'Damaged') => void;
}

export default function RefundItemsTable({
  items,
  onToggleSelect,
  onUpdateQty,
  onUpdateCondition,
}: RefundItemsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleDecrement = (id: string, currentQty: number) => {
    if (currentQty > 0) {
      onUpdateQty?.(id, currentQty - 1);
    }
  };

  const handleIncrement = (id: string, currentQty: number, maxQty: number) => {
    if (currentQty < maxQty) {
      onUpdateQty?.(id, currentQty + 1);
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    return item.item.toLowerCase().includes(query);
  });

  const displayItems = searchQuery ? filteredItems : items;

  return (
    <div className="bg-[#6b8fa3] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Items for Return</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-md border-none bg-white text-sm text-gray-900 placeholder-gray-400 w-64"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#8fa9bc] text-[#2d4a5c]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold w-12"></th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Item</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Product price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Qty purchased</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Qty to return</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Condition</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => onToggleSelect?.(item.id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.item}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.productPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">{item.qtyPurchased}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecrement(item.id, item.qtyToReturn)}
                      className="w-7 h-7 rounded-full bg-gray-400 hover:bg-gray-500 flex items-center justify-center text-white"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-gray-900">
                      {item.qtyToReturn}
                    </span>
                    <button
                      onClick={() =>
                        handleIncrement(item.id, item.qtyToReturn, item.qtyPurchased)
                      }
                      className="w-7 h-7 rounded-full bg-gray-400 hover:bg-gray-500 flex items-center justify-center text-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={item.condition}
                    onChange={(e) =>
                      onUpdateCondition?.(
                        item.id,
                        e.target.value as 'Resellable' | 'Damaged'
                      )
                    }
                    className={`
                      px-3 py-1.5 rounded text-sm border-none font-medium
                      ${
                        item.condition === 'Resellable'
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-gray-300 text-gray-700'
                      }
                    `}
                  >
                    <option value="Resellable">Resellable</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </td>
              </tr>
            ))}
            {/* Empty rows */}
            {Array.from({ length: Math.max(0, 3 - displayItems.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-gray-200">
                <td className="px-4 py-3 h-12"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {searchQuery && displayItems.length === 0 && (
        <p className="text-center text-white py-4 text-sm">No items found</p>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm text-white">
        <span className="bg-[#4a6575] px-3 py-1 rounded">ℹ️</span>
        <span>Quantities cannot exceed original purchase</span>
      </div>
    </div>
  );
}
