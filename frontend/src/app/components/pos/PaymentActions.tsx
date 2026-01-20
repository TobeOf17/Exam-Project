"use client";

import React from 'react'
import { useRouter } from 'next/navigation';

interface PaymentActionsProps {
  onConfirmClick: () => void;
  onCancelClick: () => void;
}

export default function PaymentActions({ onConfirmClick, onCancelClick }: PaymentActionsProps) {
  const router = useRouter();

  return (
    <div className="bg-[#D1D5DB] p-6 flex items-center justify-between rounded-b-lg">
      {/* Back Button */}
      <button className="w-14 h-14 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors shadow-md">
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Refund Button */}
      <button
        onClick={() => router.push('/refunds')}
        className="ml-3 px-6 py-3 bg-[#374151] hover:bg-[#4B5563] text-white font-semibold rounded-lg transition-colors shadow-md"
      >
        Refund
      </button>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Action Buttons Group - Right Side */}
      <div className="flex gap-3">
        {/* Cancel Button */}
        <button
          onClick={onCancelClick}
          className="px-6 py-3 bg-[#F87171] hover:bg-[#E85D5D] text-white font-semibold rounded-lg flex items-center justify-center transition-colors shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Confirm Button */}
        <button
          onClick={onConfirmClick}
          className="px-6 py-3 bg-[#60A5FA] hover:bg-[#4F94E8] text-white font-semibold rounded-lg transition-colors shadow-md"
        >
          Confirm
        </button>
      </div>
    </div>
  )
}
