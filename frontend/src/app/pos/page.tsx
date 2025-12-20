"use client";

import React, { useState } from 'react';
import ProductSearch from '../components/pos/ProductSearch';
import CartTable from '../components/pos/CartTable';
import OrderSummary from '../components/pos/OrderSummary';
import PaymentActions from '../components/pos/PaymentActions';

interface CartItem {
  barcode: string;
  name: string;
  quantity: number;
  price: number;
}

export default function PosPage() {
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
    <main className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
      {/* Header Section with Search */}
      <ProductSearch />

      {/* Cart Table - Takes up remaining space */}
      <div className="flex-1 overflow-auto">
        <CartTable cartItems={cartItems} updateQuantity={updateQuantity} />
      </div>

      {/* Order Summary and Payment Actions - Fixed at bottom */}
      <div className="mt-auto">
        <OrderSummary cartItems={cartItems} />
        <PaymentActions />
      </div>
    </main>
  );
}