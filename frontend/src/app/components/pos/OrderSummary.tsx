"use client";

import React from 'react'

interface CartItem {
  barcode: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
}

export default function OrderSummary({ cartItems }: OrderSummaryProps) {
  const totalAmount = cartItems.reduce((total, item) => total + (item.quantity * item.price), 0);

  return (
    <div className="bg-[#D1D5DB] p-4 flex items-center justify-between gap-3 shadow-lg">
      <div className="flex-1 bg-[#9CA3AF] px-5 py-3 rounded-lg text-center">
        <span className="text-gray-700 font-semibold">Total Amount</span>
      </div>

      <div className="flex-1 bg-[#9CA3AF] px-5 py-3 rounded-lg text-center">
        <span className="text-gray-800 font-bold text-xl">{totalAmount.toFixed(2)}</span>
      </div>

      <div className="bg-[#9CA3AF] px-3 py-3 rounded-lg flex items-center justify-center">
        <span className="text-gray-700 font-bold text-lg">N</span>
      </div>
    </div>
  )
}
