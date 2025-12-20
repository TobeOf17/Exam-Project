"use client";

import React, { useState } from 'react'

interface CartItem {
  barcode: string;
  name: string;
  quantity: number;
  price: number;
}

export default function CartTable() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { barcode: '234934474747', name: 'PRODUCT 1', quantity: 1, price: 2000.00 },
    { barcode: '834959948420', name: 'PRODUCT 2', quantity: 2, price: 2000.00 },
  ]);

  const updateQuantity = (index: number, delta: number) => {
    setCartItems(items => {
      const newItems = [...items];
      const newQty = newItems[index].quantity + delta;
      if (newQty > 0) {
        newItems[index].quantity = newQty;
      }
      return newItems;
    });
  };

  return (
    <div className="bg-[#34516A] overflow-hidden shadow-lg">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#7A9AAE] text-gray-700">
            <th className="px-4 py-2 text-left font-semibold text-sm">Product barcode</th>
            <th className="px-4 py-2 text-left font-semibold text-sm">Product name</th>
            <th className="px-4 py-2 text-center font-semibold text-sm">Qty</th>
            <th className="px-4 py-2 text-right font-semibold text-sm">Price</th>
            <th className="px-4 py-2 text-right font-semibold text-sm">Total</th>
          </tr>
        </thead>

        <tbody>
          {cartItems.map((item, index) => (
            <tr key={index} className="bg-[#8FA9BC] border-b-2 border-[#34516A]">
              <td className="px-4 py-2 text-gray-800 text-sm">{item.barcode}</td>
              <td className="px-4 py-2 text-gray-800 text-sm">{item.name}</td>
              <td className="px-4 py-2">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => updateQuantity(index, -1)}
                    className="w-7 h-7 bg-[#7A9AAE] hover:bg-[#6A8A9E] rounded flex items-center justify-center text-gray-700 font-bold text-sm"
                  >
                    −
                  </button>
                  <span className="w-10 text-center bg-[#7A9AAE] rounded px-2 py-0.5 text-gray-800 font-semibold text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(index, 1)}
                    className="w-7 h-7 bg-[#7A9AAE] hover:bg-[#6A8A9E] rounded flex items-center justify-center text-gray-700 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="px-4 py-2 text-right text-gray-800 text-sm">{item.price.toFixed(2)}</td>
              <td className="px-4 py-2 text-right text-gray-800 font-semibold text-sm">
                {(item.quantity * item.price).toFixed(2)}
              </td>
            </tr>
          ))}

          {/* Empty rows to fill the space */}
          {[...Array(Math.max(0, 15 - cartItems.length))].map((_, i) => (
            <tr key={`empty-${i}`} className="bg-[#8FA9BC] border-b-2 border-[#34516A]">
              <td className="px-4 py-2 text-gray-800 text-sm">&nbsp;</td>
              <td className="px-4 py-2 text-gray-800 text-sm"></td>
              <td className="px-4 py-2"></td>
              <td className="px-4 py-2"></td>
              <td className="px-4 py-2"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
