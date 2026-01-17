'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { InventorySidebar, InventoryHeader } from '@/app/components/inventory';

// CORRECTED INTERFACE to match your Backend Serializer
interface StockLevel {
  id: number;
  quantity: number;
  product_name: string; // Your backend sends this string directly!
  sku_details: {
    id: number;
    code?: string;      // It might be called 'code'
    sku_code?: string;  // Or it might be called 'sku_code'
  };
}

export default function InventoryListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateSearch, setDateSearch] = useState('');
  
  const [inventory, setInventory] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStockLevels = async () => {
      const token = localStorage.getItem("access");
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/stock-levels/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
           if (response.status === 401) router.push('/login');
           throw new Error("Failed to load inventory");
        }

        const data = await response.json();
        const items = Array.isArray(data) ? data : data.results || [];
        setInventory(items);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStockLevels();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <InventorySidebar />

      <div className="flex-1 flex flex-col">
        <InventoryHeader
          searchPlaceholder="Search Inventory..."
          onSearch={setSearchQuery}
        />

        <main className="flex-1 p-6">
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="bg-[#a8c5d8] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#2d4a5c] font-semibold text-lg">
                    Current Stock Levels (Live)
                  </h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={dateSearch}
                      onChange={(e) => setDateSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-md border-none bg-white text-sm text-gray-900 placeholder-gray-400 w-64"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  </div>
                </div>

                <div className="bg-white rounded-lg overflow-hidden min-h-[400px]">
                  {loading ? (
                    <div className="p-10 text-center text-[#2d4a5c]">Loading Data from Backend...</div>
                  ) : error ? (
                    <div className="p-10 text-center text-red-500">{error}</div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-[#8fa9bc] text-[#2d4a5c]">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">SKU Code</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Product Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Qty In Stock</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                              No inventory items found.
                            </td>
                          </tr>
                        ) : (
                          inventory.map((item, index) => (
                            <tr
                              key={item.id || index}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              {/* 1. SKU CODE: Checking both potential names */}
                              <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                {item.sku_details?.code || item.sku_details?.sku_code || "N/A"}
                              </td>
                              
                              {/* 2. PRODUCT NAME: Using the direct field from serializer */}
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                {item.product_name || "Unknown"}
                              </td>
                              
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-3 py-1 rounded text-white ${item.quantity < 10 ? 'bg-red-400' : 'bg-[#6b8fa3]'}`}>
                                  {item.quantity}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {item.quantity > 0 ? 'Active' : 'Out of Stock'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
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