"use client";

import React, { useState, useEffect, useRef } from 'react';

// 1. UPDATED INTERFACE TO MATCH YOUR SCREENSHOT
interface BackendProduct {
  id: number;
  sku_code: string;
  barcode: string;
  base_price: string; // e.g. "20.00"
  product_name: string; // e.g. "Test Apple"
}

interface ProductSearchProps {
  onAddToCart: (item: any) => void;
}

export default function ProductSearch({ onAddToCart }: ProductSearchProps) {
  const [searchType, setSearchType] = useState<'barcode' | 'product'>('barcode');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  const [searchResults, setSearchResults] = useState<BackendProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (searchValue.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const token = localStorage.getItem("access");

      try {
        const res = await fetch(`http://127.0.0.1:8000/api/skus/?search=${searchValue}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setSearchResults(Array.isArray(data) ? data : data.results || []);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchProducts, 400); 
    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  // 2. UPDATED MAPPING LOGIC
  const handleSelectProduct = (product: BackendProduct) => {
    onAddToCart({
      sku_id: product.id, 
      barcode: product.barcode || product.sku_code || "N/A",
      // USE THE CORRECT FIELD NAMES FROM YOUR SCREENSHOT:
      name: product.product_name, 
      price: parseFloat(product.base_price), 
      quantity: 1,
      availableQty: 99 
    });
    setSearchValue(''); 
    setSearchResults([]); 
  };

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="bg-[#34516A] p-6 relative z-50" ref={wrapperRef}>
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

      <div className="flex justify-end gap-2 relative">
        <div className="relative w-80 flex gap-2">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchType === 'barcode' ? 'Search by barcode...' : 'Search by product name...'}
            className="flex-1 bg-[#496A86] text-gray-200 placeholder-gray-400 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          
          {/* SEARCH RESULTS DROPDOWN */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                {searchResults.map((item) => (
                    <div 
                        key={item.id} 
                        onClick={() => handleSelectProduct(item)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex justify-between items-center"
                    >
                        <div className="text-left">
                            {/* UPDATED DISPLAY NAMES */}
                            <p className="font-bold text-gray-800 text-sm">{item.product_name}</p>
                            <p className="text-xs text-gray-500">{item.barcode || item.sku_code}</p>
                        </div>
                        <div className="text-blue-600 font-bold text-sm">
                            ${parseFloat(item.base_price).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
          )}

          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-[#496A86] text-gray-300 px-3 py-2.5 rounded-lg hover:bg-[#5A7B97] focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full mt-2 right-0 w-64 bg-[#496A86] rounded-lg shadow-lg z-10 overflow-hidden">
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

        <button className="bg-[#496A86] px-4 py-2.5 rounded-lg hover:bg-[#5A7B97] focus:outline-none focus:ring-2 focus:ring-blue-400">
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}