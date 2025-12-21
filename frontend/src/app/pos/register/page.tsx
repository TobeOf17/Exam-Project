"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Register {
  id: number;
  name: string;
  status: 'available' | 'in-use';
}

export default function RegisterPage() {
  const router = useRouter();
  const [registers] = useState<Register[]>([
    { id: 1, name: 'Register 1', status: 'in-use' },
    { id: 2, name: 'Register 2', status: 'in-use' },
    { id: 3, name: 'Register 3', status: 'available' },
    { id: 4, name: 'Register 4', status: 'available' },
    { id: 5, name: 'Register 5', status: 'available' },
    { id: 6, name: 'Register 6', status: 'available' },
  ]);

  const handleRegisterSelect = (registerId: number) => {
    // Navigate to POS checkout page
    router.push('/pos');
  };

  return (
    <main className="h-screen bg-gradient-to-br from-[#2C4A6A] to-[#1e3a52] flex">
      {/* Left Side */}
      <div className="w-2/5 p-12 flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-12">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h1 className="text-2xl font-semibold text-gray-200">Checkout</h1>
          </div>

          {/* Welcome Message */}
          <div className="mb-12">
            <h2 className="text-6xl font-light text-gray-300 mb-4">
              Welcome back
            </h2>
            <h2 className="text-6xl font-bold text-amber-500 mb-8">
              john!
            </h2>
          </div>

          {/* Instructions */}
          <p className="text-gray-300 text-2xl mb-12 leading-relaxed">
            Please select a register to begin your checkout session.
          </p>

          {/* Open Register Button */}
          <button className="w-full bg-[#4ADE80] hover:bg-[#3BC670] text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-between transition-colors group">
            <span className="text-lg">Open Register</span>
            <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Back Button */}
        <button className="w-16 h-16 bg-[#4A6B85] hover:bg-[#5A7B95] rounded-full flex items-center justify-center transition-colors">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>

      {/* Right Side - Register Grid */}
      <div className="flex-1 p-12 flex items-center justify-center">
        {/* User Profile - Top Right */}
        <div className="absolute top-6 right-6 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">J</span>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Register Cards Grid */}
        <div className="grid grid-cols-2 gap-6 max-w-2xl w-full">
          {registers.map((register) => (
            <button
              key={register.id}
              onClick={() => handleRegisterSelect(register.id)}
              disabled={register.status === 'in-use'}
              className={`
                relative p-8 rounded-2xl transition-all duration-200 transform hover:scale-105
                ${register.status === 'available'
                  ? 'bg-[#8FB4D4] hover:bg-[#7FA4C4] border-2 border-transparent hover:border-[#4ADE80]'
                  : 'bg-[#8FB4D4] opacity-75 cursor-not-allowed'
                }
                ${register.id === 3 ? 'border-[#4ADE80]' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-white">{register.name}</h3>
                <div className="w-12 h-12 bg-[#5A7B95] rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <span
                className={`
                  inline-block px-4 py-1 rounded-full text-sm font-semibold
                  ${register.status === 'available'
                    ? 'bg-[#4ADE80] text-white'
                    : 'bg-[#F87171] text-white'
                  }
                `}
              >
                {register.status === 'available' ? 'Available' : 'In use'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
