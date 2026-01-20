"use client";

import React, { useState, useEffect } from 'react';
import ProductSearch from '../components/pos/ProductSearch';
import CartTable from '../components/pos/CartTable';
import OrderSummary from '../components/pos/OrderSummary';
import PaymentActions from '../components/pos/PaymentActions';
import PaymentModal from '../components/pos/PaymentModal';
import { useInventoryStore } from '../store/inventoryStore';

interface CartItem {
  barcode: string;
  name: string;
  quantity: number;
  price: number;
  availableQty?: number;
  skuId?: number;
}

export default function PosPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showCancelMessage, setShowCancelMessage] = useState(false);

  const fetchInventory = useInventoryStore((state) => state.fetchInventory);
  const fetchStores = useInventoryStore((state) => state.fetchStores);
  const fetchRegisters = useInventoryStore((state) => state.fetchRegisters);

  // Fetch inventory on mount
  useEffect(() => {
    fetchStores().then(() => {
      fetchInventory();
      fetchRegisters();
    });
  }, [fetchStores, fetchInventory, fetchRegisters]);

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

  const setQuantity = (index: number, qty: number) => {
    setCartItems(items => {
      const newItems = [...items];
      if (qty > 0) {
        newItems[index].quantity = qty;
      }
      return newItems;
    });
  };

  const totalAmount = cartItems.reduce((total, item) => total + (item.quantity * item.price), 0);

  const handleConfirmClick = () => {
    setIsPaymentModalOpen(true);
  };

  const handleCancelClick = () => {
    // Clear the cart
    setCartItems([]);
    // Show cancel message
    setShowCancelMessage(true);
    // Hide message after 2 seconds
    setTimeout(() => {
      setShowCancelMessage(false);
    }, 2000);
  };

  const handleAddToCart = (item: {
    barcode: string;
    name: string;
    quantity: number;
    price: number;
    availableQty: number;
    skuId: number;
  }) => {
    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingIndex = prevItems.findIndex((i) => i.barcode === item.barcode);

      if (existingIndex !== -1) {
        // Item exists, increase quantity (but don't exceed available)
        const newItems = [...prevItems];
        const newQty = newItems[existingIndex].quantity + 1;
        if (newQty <= item.availableQty) {
          newItems[existingIndex].quantity = newQty;
        }
        return newItems;
      } else {
        // Add new item to cart with skuId
        return [...prevItems, {
          barcode: item.barcode,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          availableQty: item.availableQty,
          skuId: item.skuId,
        }];
      }
    });
  };

  return (
    <main className="h-screen bg-gradient-to-br from-[#e8f0f5] to-[#d4e3ed] flex flex-col overflow-hidden">
      {/* Header Section with Search */}
      <ProductSearch onAddToCart={handleAddToCart} />

      {/* Cart Table - Fixed height with internal scroll */}
      <div className="flex-1 min-h-0">
        <CartTable
          cartItems={cartItems}
          updateQuantity={updateQuantity}
          setQuantity={setQuantity}
          showCancelMessage={showCancelMessage}
        />
      </div>

      {/* Order Summary and Payment Actions - Fixed at bottom */}
      <div className="flex-shrink-0">
        <OrderSummary cartItems={cartItems} />
        <PaymentActions
          onConfirmClick={handleConfirmClick}
          onCancelClick={handleCancelClick}
        />
      </div>

      {/* Payment Modal */}
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