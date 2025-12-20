"use client";

import React from 'react'

export default function OrderSummary() {
  // This would come from cart state in a real app
  const totalAmount = 5200.00;

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
