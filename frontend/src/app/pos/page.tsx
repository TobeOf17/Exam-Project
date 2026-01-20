"use client";

import React, { useState } from 'react';
// Ensure these paths are correct based on your folder structure
import ProductSearch from '../components/pos/ProductSearch';
import CartTable from '../components/pos/CartTable';
import OrderSummary from '../components/pos/OrderSummary';
import PaymentActions from '../components/pos/PaymentActions';
import PaymentModal from '../components/pos/PaymentModal';

interface CartItem {
  sku_id?: number; // Added for backend link
  barcode: string;
  name: string;
  quantity: number;
  price: number;
  availableQty?: number;
}

export default function PosPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showCancelMessage, setShowCancelMessage] = useState(false);

  const updateQuantity = (index: number, delta: number) => {
    setCartItems(items => {
      const newItems = [...items];
      const newQty = newItems[index].quantity + delta;
      if (newQty > 0) newItems[index].quantity = newQty;
      return newItems;
    });
  };

  const setQuantity = (index: number, qty: number) => {
    setCartItems(items => {
      const newItems = [...items];
      if (qty > 0) newItems[index].quantity = qty;
      return newItems;
    });
  };

  const totalAmount = cartItems.reduce((total, item) => total + (item.quantity * item.price), 0);

  const handleConfirmClick = () => {
    if (cartItems.length === 0) {
        alert("Cart is empty!");
        return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleCancelClick = () => {
    setCartItems([]);
    setShowCancelMessage(true);
    setTimeout(() => setShowCancelMessage(false), 2000);
  };

  const handleAddToCart = (item: any) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.barcode === item.barcode);
      if (existingIndex !== -1) {
        const newItems = [...prevItems];
        newItems[existingIndex].quantity += 1;
        return newItems;
      } else {
        return [...prevItems, { ...item }];
      }
    });
  };

  return (
    <main className="h-screen w-full bg-gradient-to-br from-[#e8f0f5] to-[#d4e3ed] flex flex-col relative overflow-hidden">
      
      {/* 1. Header (Search) */}
      <div className="flex-shrink-0">
        <ProductSearch onAddToCart={handleAddToCart} />
      </div>

      {/* 2. Cart Table (Scrollable Middle) */}
      {/* We add padding-bottom (pb-40) so the last item isn't hidden behind the footer */}
      <div className="flex-1 overflow-y-auto pb-48">
        <CartTable
          cartItems={cartItems}
          updateQuantity={updateQuantity}
          setQuantity={setQuantity}
          showCancelMessage={showCancelMessage}
        />
      </div>

      {/* 3. Footer (Fixed to Bottom) */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-2xl z-40">
        <div className="max-w-7xl mx-auto">
            {/* If OrderSummary/PaymentActions are separate files, we wrap them here */}
            <OrderSummary cartItems={cartItems} />
            <PaymentActions
              onConfirmClick={handleConfirmClick}
              onCancelClick={handleCancelClick}
            />
        </div>
      </div>

      {/* 4. Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={totalAmount}
        cartItems={cartItems}
        onSaleComplete={() => setCartItems([])}
      />
    </main>
  );
}