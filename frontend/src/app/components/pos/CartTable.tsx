"use client";

import React from 'react'

interface CartItem {
  barcode: string;
  name: string;
  quantity: number;
  price: number;
}

interface CartTableProps {
  cartItems: CartItem[];
  updateQuantity: (index: number, delta: number) => void;
  setQuantity: (index: number, qty: number) => void;
  showCancelMessage?: boolean;
}

export default function CartTable({ cartItems, updateQuantity, setQuantity, showCancelMessage }: CartTableProps) {

  return (
    <div className="px-6 py-4 h-full flex flex-col">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 relative flex flex-col flex-1">
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-[#5A7B97] to-[#7A9AAE]">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-sm text-white tracking-wide w-[20%]">Product Barcode</th>
                <th className="px-6 py-4 text-left font-semibold text-sm text-white tracking-wide w-[30%]">Product Name</th>
                <th className="px-6 py-4 text-center font-semibold text-sm text-white tracking-wide w-[20%]">Qty</th>
                <th className="px-6 py-4 text-right font-semibold text-sm text-white tracking-wide w-[15%]">Price</th>
                <th className="px-6 py-4 text-right font-semibold text-sm text-white tracking-wide w-[15%]">Total</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <tbody>
              {cartItems.map((item, index) => (
                <tr
                  key={index}
                  className="bg-[#f8fafc] border-b border-gray-200 hover:bg-[#e2e8f0] transition-colors duration-200"
                >
                  <td className="px-6 py-3 text-gray-600 text-sm font-mono w-[20%]">{item.barcode}</td>
                  <td className="px-6 py-3 text-gray-800 text-sm font-medium w-[30%]">{item.name}</td>
                  <td className="px-6 py-3 w-[20%]">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center text-gray-700 font-bold text-sm transition-all duration-200 shadow-sm"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value) || 1;
                          setQuantity(index, newQty);
                        }}
                        className="w-16 text-center bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7B97]"
                      />
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center text-gray-700 font-bold text-sm transition-all duration-200 shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right text-gray-600 text-sm w-[15%]">{item.price.toFixed(2)}</td>
                  <td className="px-6 py-3 text-right text-gray-800 font-bold text-sm w-[15%]">
                    {(item.quantity * item.price).toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* Empty state when no items */}
              {cartItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm">Search and add products to cart</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sale Cancelled Message Overlay */}
        {showCancelMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white text-gray-700 px-10 py-5 rounded-2xl shadow-2xl font-semibold text-lg border border-gray-200">
              Sale cancelled
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
