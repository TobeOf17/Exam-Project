"use client";

import React, { useState } from 'react';
import { Printer } from 'lucide-react';
// import { useSalesStore, SaleItem } from '../../store/salesStore'; // Optional if you use store

interface CartItem {
  sku_id?: number; // Added this
  barcode: string;
  name: string;
  quantity: number;
  price: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  cartItems: CartItem[];
  onSaleComplete: () => void;
}

export default function PaymentModal({ isOpen, onClose, totalAmount, cartItems, onSaleComplete }: PaymentModalProps) {
  const [cashAmount, setCashAmount] = useState('0.00');
  const [cardAmount, setCardAmount] = useState('0.00');
  const [transferAmount, setTransferAmount] = useState('0.00');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [showSold, setShowSold] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPaid = parseFloat(cashAmount || '0') + parseFloat(cardAmount || '0') + parseFloat(transferAmount || '0');
  const change = totalPaid - totalAmount;

  const handleConfirm = async () => {
    setIsProcessing(true);
    setIsFailed(false);

    try {
        const token = localStorage.getItem("access");
        
        // 1. PREPARE DATA FOR DJANGO
        const payload = {
            store: 1,      // Default ID
            register: 1,   // Default ID
            cashier: 1,    // Default ID
            total_amount: totalAmount,
            payment_method: "CASH", // Backend requires string, we send CASH for now
            lines: cartItems.map(item => ({
                sku: item.sku_id, 
                quantity: item.quantity,
                unit_price: item.price
            }))
        };

        // 2. SEND TO BACKEND
        const response = await fetch('http://127.0.0.1:8000/api/sales/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            // SUCCESS
            setCurrentOrderId(data.id.toString()); // Use Backend ID
            setIsProcessing(false);
            setIsApproved(true);
        } else {
            // FAILURE
            console.error(data);
            setIsProcessing(false);
            setIsFailed(true);
            alert("Sale Failed: " + JSON.stringify(data));
        }

    } catch (error) {
        console.error('Payment Error', error);
        setIsProcessing(false);
        setIsFailed(true);
    }
  };

  const handlePrint = async () => {
    // Show SOLD message
    setShowSold(true);
    // Wait for 3 seconds then close
    await new Promise(resolve => setTimeout(resolve, 3000));
    onSaleComplete();
    resetAndClose();
  };

  const handleSave = async () => {
    // Show SOLD message
    setShowSold(true);
    // Wait for 3 seconds then close
    await new Promise(resolve => setTimeout(resolve, 3000));
    onSaleComplete();
    resetAndClose();
  };

  const resetAndClose = () => {
    setCashAmount('0.00');
    setCardAmount('0.00');
    setTransferAmount('0.00');
    setIsProcessing(false);
    setIsApproved(false);
    setIsFailed(false);
    setShowSold(false);
    setCurrentOrderId(null);
    onClose();
  };

  // Show SOLD message if sale is complete
  if (showSold) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="bg-blue-300 text-gray-700 font-bold text-2xl py-4 text-center rounded-lg">
            SOLD !
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">Order ID</p>
            <p className="text-gray-800 font-bold text-xl">#{currentOrderId}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-blue-100 to-white rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm">
        {/* Total Display */}
        <div className="mb-6 flex items-center gap-3">
          <label className="text-gray-700 font-semibold text-lg">Total :</label>
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={change.toFixed(2)}
              readOnly
              className="flex-1 bg-blue-200 text-gray-800 font-bold text-center px-4 py-2 rounded-lg border-2 border-blue-300"
            />
            <div className="bg-blue-200 border-2 border-blue-300 px-3 py-2 rounded-lg">
              <span className="text-gray-700 font-bold">N</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3 mb-6">
          {/* Cash */}
          <div className="flex items-center gap-3">
            <button className="bg-blue-200 hover:bg-blue-300 text-gray-700 font-semibold px-6 py-2 rounded-lg border-2 border-blue-300 w-28">
              Cash
            </button>
            <input
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              disabled={isApproved}
              className="flex-1 bg-blue-200 text-gray-800 font-semibold text-center px-4 py-2 rounded-lg border-2 border-blue-300 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          {/* Card */}
          <div className="flex items-center gap-3">
            <button className="bg-blue-200 hover:bg-blue-300 text-gray-700 font-semibold px-6 py-2 rounded-lg border-2 border-blue-300 w-28">
              Card
            </button>
            <input
              type="number"
              value={cardAmount}
              onChange={(e) => setCardAmount(e.target.value)}
              disabled={isApproved}
              className="flex-1 bg-blue-200 text-gray-800 font-semibold text-center px-4 py-2 rounded-lg border-2 border-blue-300 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          {/* Transfer */}
          <div className="flex items-center gap-3">
            <button className="bg-blue-200 hover:bg-blue-300 text-gray-700 font-semibold px-6 py-2 rounded-lg border-2 border-blue-300 w-28">
              Transfer
            </button>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              disabled={isApproved}
              className="flex-1 bg-blue-200 text-gray-800 font-semibold text-center px-4 py-2 rounded-lg border-2 border-blue-300 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={isProcessing || isApproved}
          className={`w-full font-bold py-4 rounded-lg mb-4 transition-colors shadow-md flex items-center justify-center gap-2 ${
            isFailed
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-400 hover:bg-green-500 disabled:bg-green-400 disabled:cursor-not-allowed text-white'
          }`}
        >
          {isProcessing ? (
            <span className="text-2xl">• • •</span>
          ) : isApproved ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : isFailed ? (
            <span>Payment Failed (Retry)</span>
          ) : (
            <span>Confirm Payment</span>
          )}
        </button>

        {/* Print and Save Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            disabled={!isApproved}
            className="flex-1 bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={!isApproved}
            className="flex-1 bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}