"use client";

import React, { useState } from 'react'

export default function ProductSearch() {
  const [searchType, setSearchType] = useState<'barcode' | 'product'>('barcode');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="bg-[#34516A] p-6">
      {/* Header with Checkout title and User Profile */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h1 className="text-2xl font-semibold text-gray-200">Checkout</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold text-sm">
            JD
          </div>
          <span className="text-gray-200">John D</span>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Search Bar with Dropdown - Right Aligned */}
      <div className="flex justify-end gap-2">
        <div className="relative w-80">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full bg-[#496A86] text-gray-300 px-4 py-2.5 rounded-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <span className="text-sm">{searchType === 'barcode' ? 'Search by barcode...' : 'Search by product name...'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full mt-2 w-full bg-[#496A86] rounded-lg shadow-lg z-10 overflow-hidden">
              <button
                onClick={() => {
                  setSearchType('barcode');
                  setDropdownOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-gray-300 hover:bg-[#5A7B97] flex justify-between items-center text-sm"
              >
                <span>Search by barcode</span>
                {searchType === 'barcode' && (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => {
                  setSearchType('product');
                  setDropdownOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-gray-300 hover:bg-[#5A7B97] flex justify-between items-center text-sm"
              >
                <span>Search by product name</span>
                {searchType === 'product' && (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button className="bg-[#496A86] px-4 py-2.5 rounded-lg hover:bg-[#5A7B97] focus:outline-none focus:ring-2 focus:ring-blue-400">
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
