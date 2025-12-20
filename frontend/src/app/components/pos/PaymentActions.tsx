"use client";

import React from 'react'

export default function PaymentActions() {
  return (
    <div className="bg-[#D1D5DB] p-6 flex items-center justify-between rounded-b-lg">
      {/* Back Button */}
      <button className="w-14 h-14 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors shadow-md">
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Action Buttons Group - Right Side */}
      <div className="flex gap-3">
        {/* Hold Button */}
        <button className="px-6 py-3 bg-[#4ADE80] hover:bg-[#3BC670] text-white font-semibold rounded-lg transition-colors shadow-md">
          Hold
        </button>

        {/* Cancel Button */}
        <button className="px-6 py-3 bg-[#F87171] hover:bg-[#E85D5D] text-white font-semibold rounded-lg flex items-center justify-center transition-colors shadow-md">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Confirm Button */}
        <button className="px-6 py-3 bg-[#60A5FA] hover:bg-[#4F94E8] text-white font-semibold rounded-lg transition-colors shadow-md">
          Confirm
        </button>
      </div>
    </div>
  )
}
