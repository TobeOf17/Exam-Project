'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { InventorySidebar, InventoryHeader } from '@/app/components/inventory';

// CORRECTED INTERFACE based on your "Spy Script" results
interface APIPurchaseOrder {
  id: number;
  supplier_name: string;
  status: string;
  created_at: string;
  lines: {
    id: number;
    sku: number;
    quantity: number;
    // MATCHING YOUR BACKEND SERIALIZER STRUCTURE
    sku_details: {
        id: number;
        product_name?: string; // It sent this in your console log
        product?: { name: string }; // Fallback
        sku_code?: string;
        barcode?: string;
    };
  }[];
}

export default function ReceiveStockPage() {
  const router = useRouter();
  const [pendingOrders, setPendingOrders] = useState<APIPurchaseOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<APIPurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 1. FETCH PENDING ORDERS
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
      const res = await fetch('http://127.0.0.1:8000/api/purchase-orders/?status=PENDING', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : data.results || [];
        setPendingOrders(results);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (order: APIPurchaseOrder) => {
    setSelectedOrder(order);
    setSuccessMsg('');
  };

  // 2. THE TRIGGER
  const handleConfirmReceiving = async () => {
    if (!selectedOrder) return;
    setProcessing(true);
    
    const token = localStorage.getItem("access");

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/purchase-orders/${selectedOrder.id}/receive/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ store_id: 1 }) 
        });

        if (res.ok) {
            setSuccessMsg(`Success! PO #${selectedOrder.id} received. Stock updated.`);
            setPendingOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
            setSelectedOrder(null);
        } else {
            const err = await res.json();
            alert("Error: " + JSON.stringify(err));
        }
    } catch (error) {
        alert("Network Error");
    } finally {
        setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <InventorySidebar />

      <div className="flex-1 flex flex-col">
        <InventoryHeader searchPlaceholder="Search Pending Orders..." onSearch={() => {}} />

        <main className="flex-1 p-6">
          <div className="flex gap-6">
            
            {/* LEFT: Order Details & Actions */}
            <div className="flex-1">
              <div className="bg-[#a8c5d8] rounded-lg p-4 min-h-[500px]">
                <h2 className="text-[#2d4a5c] font-semibold text-lg mb-4">
                  {selectedOrder ? `Receiving PO #${selectedOrder.id}` : 'Select an Order to Receive'}
                </h2>

                {selectedOrder ? (
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                    {/* Order Meta */}
                    <div className="p-4 border-b bg-gray-50 flex justify-between">
                        <div>
                            <span className="text-sm text-gray-500">Supplier:</span>
                            <p className="font-bold text-[#2d4a5c]">{selectedOrder.supplier_name}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Date:</span>
                            <p className="font-bold text-[#2d4a5c]">
                                {new Date(selectedOrder.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full">
                      <thead className="bg-[#8fa9bc] text-[#2d4a5c]">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-bold text-black">Product</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-black">Ordered Qty</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-black">Received Qty</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-black">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.lines.map((line, idx) => (
                          <tr key={idx} className="border-b">
                            {/* PRODUCT NAME FIX */}
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {line.sku_details?.product_name || line.sku_details?.product?.name || "Unknown"}
                                <div className="text-xs text-gray-500">
                                    {line.sku_details?.sku_code || line.sku_details?.barcode}
                                </div>
                            </td>
                            {/* ORDERED QTY */}
                            <td className="px-4 py-3 font-bold text-gray-900">{line.quantity}</td>
                            {/* RECEIVED QTY */}
                            <td className="px-4 py-3 text-green-600 font-bold">{line.quantity}</td>
                            {/* STATUS */}
                            <td className="px-4 py-3 text-xs">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded inline-block">MATCH</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* ACTIONS - FORCED VISIBILITY */}
                    <div className="p-6 bg-gray-100 border-t border-gray-300">
                        <div className="flex justify-end">
                            <button 
                                onClick={handleConfirmReceiving}
                                disabled={processing}
                                className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-white shadow-md transition-colors ${
                                    processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {processing ? "Processing..." : "CONFIRM & UPDATE STOCK"}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-right">
                            * Clicking this button will immediately update inventory counts.
                        </p>
                    </div>
                  </div>
                ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                        {successMsg ? (
                            <div className="text-green-600 font-bold text-lg bg-white p-6 rounded shadow border-l-4 border-green-500">
                                ✅ {successMsg}
                            </div>
                        ) : (
                            <p>Please select a Pending Order from the list on the right.</p>
                        )}
                    </div>
                )}
              </div>
            </div>

            {/* RIGHT: List of Pending Orders */}
            <div className="bg-[#b8d4e8] rounded-lg p-6 min-w-[300px]">
              <h3 className="text-[#2d4a5c] font-semibold text-lg mb-4">Pending Deliveries</h3>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : pendingOrders.length === 0 ? (
                    <div className="bg-white p-4 rounded text-center text-sm text-gray-500">
                        No pending orders found.
                    </div>
                ) : (
                    pendingOrders.map(order => (
                        <div 
                            key={order.id}
                            onClick={() => handleSelectOrder(order)}
                            className={`p-4 rounded-lg cursor-pointer transition border-l-4 shadow-sm ${
                                selectedOrder?.id === order.id 
                                    ? 'bg-white border-blue-500 ring-2 ring-blue-200' 
                                    : 'bg-white/80 border-transparent hover:bg-white'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <span className="font-mono font-bold text-[#2d4a5c]">PO #{order.id}</span>
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">PENDING</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{order.supplier_name || "Unknown Supplier"}</p>
                            <p className="text-xs text-gray-400 mt-2">
                                {new Date(order.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))
                )}
              </div>
            </div>

          </div>
          
          <button onClick={() => router.back()} className="mt-6 bg-[#4a6575] hover:bg-[#3d5a6c] text-white p-3 rounded-full">
            <ArrowLeft size={24} />
          </button>
        </main>
      </div>
    </div>
  );
}