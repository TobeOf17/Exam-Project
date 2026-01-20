"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useInventoryStore, type InventoryItem } from '@/app/store/inventoryStore';
import { useAuthStore } from '@/app/store/authStore';

interface ProductSearchProps {
  onAddToCart?: (item: {
    barcode: string;
    name: string;
    quantity: number;
    price: number;
    availableQty: number;
    skuId: number;
  }) => void;
}

export default function ProductSearch({ onAddToCart }: ProductSearchProps) {
  const [searchType, setSearchType] = useState<'barcode' | 'product'>('barcode');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const router = useRouter();
  const searchInventory = useInventoryStore((state) => state.searchInventory);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Get user initials (e.g., "John Manager" -> "JM")
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleSearch = () => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = searchInventory(searchValue);
    setSearchResults(results);
    setShowResults(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddProduct = (item: InventoryItem) => {
    if (onAddToCart) {
      onAddToCart({
        barcode: item.barcode,
        name: item.productName,
        quantity: 1,
        price: item.sellingPrice,
        availableQty: item.quantity,
        skuId: item.skuId,
      });
    }
    setSearchValue('');
    setSearchResults([]);
    setShowResults(false);
  };

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

        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold text-sm">
              {userInitials}
            </div>
            <span className="text-gray-200">{user?.name || 'User'}</span>
            <svg className={`w-4 h-4 text-gray-300 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isUserDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar with Dropdown - Right Aligned */}
      <div className="flex justify-end gap-2">
        <div className="relative w-80 flex gap-2">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchType === 'barcode' ? 'Search by barcode...' : 'Search by product name...'}
            className="flex-1 bg-[#496A86] text-gray-200 placeholder-gray-400 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-[#496A86] text-gray-300 px-3 py-2.5 rounded-lg hover:bg-[#5A7B97] focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Change search type"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full mt-2 right-0 w-64 bg-[#496A86] rounded-lg shadow-lg z-20 overflow-hidden">
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

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-2 left-0 right-12 bg-white rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  No products found with quantity {'>'} 0
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.barcode}
                    onClick={() => handleAddProduct(item)}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                        <p className="text-xs text-gray-500 font-mono">{item.barcode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">{item.sellingPrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-[#496A86] px-4 py-2.5 rounded-lg hover:bg-[#5A7B97] focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
