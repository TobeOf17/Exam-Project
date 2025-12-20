import React from 'react';
import ProductSearch from '../components/pos/ProductSearch';
import CartTable from '../components/pos/CartTable';
import OrderSummary from '../components/pos/OrderSummary';
import PaymentActions from '../components/pos/PaymentActions';

export default function PosPage() {
  return (
    <main className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
      {/* Header Section with Search */}
      <ProductSearch />

      {/* Cart Table - Takes up remaining space */}
      <div className="flex-1 overflow-auto">
        <CartTable />
      </div>

      {/* Order Summary and Payment Actions - Fixed at bottom */}
      <div className="mt-auto">
        <OrderSummary />
        <PaymentActions />
      </div>
    </main>
  );
}