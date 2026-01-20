'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { InventorySidebar, InventoryHeader } from '@/app/components/inventory';

interface Sale {
  id: number;
  total_amount: number | string;
  payment_method: string;
  created_at: string;
  cashier_name?: string;
  register_identifier?: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (msg: string) => setDebugLog(prev => [...prev, msg]);

  useEffect(() => {
    const fetchSales = async () => {
      const token = localStorage.getItem("access");
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        addLog("Fetching /api/sales/...");
        const res = await fetch('http://127.0.0.1:8000/api/sales/', {
          headers: { "Authorization": `Bearer ${token}` }
        });

        addLog(`Status: ${res.status}`);

        if (res.ok) {
          const data = await res.json();
          addLog(`Raw Data: ${JSON.stringify(data).slice(0, 200)}...`); // Show first 200 chars
          
          const results = Array.isArray(data) ? data : data.results || [];
          addLog(`Found ${results.length} items.`);
          
          if (results.length > 0) {
             addLog(`First Item Keys: ${Object.keys(results[0]).join(', ')}`);
          }
          
          setSales(results);
        } else {
          const txt = await res.text();
          addLog(`Error: ${txt}`);
        }
      } catch (err: any) {
        addLog(`CRASH: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [router]);

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <InventorySidebar />

      <div className="flex-1 flex flex-col">
        <InventoryHeader searchPlaceholder="Search Reports..." onSearch={() => {}} />

        <main className="flex-1 p-6">
          
          {/* DEBUG BOX */}
          <div className="bg-black text-green-400 p-4 mb-4 rounded font-mono text-xs mb-6">
            <strong>DEBUG DATA:</strong>
            {debugLog.map((l, i) => <div key={i}>{l}</div>)}
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <div className="bg-[#a8c5d8] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#2d4a5c] font-semibold text-lg">Sales Report</h2>
                </div>

                <div className="bg-white rounded-lg overflow-hidden min-h-[400px]">
                    <table className="w-full text-left">
                      <thead className="bg-[#8fa9bc] text-[#2d4a5c]">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-sm">Sale ID</th>
                          <th className="px-4 py-3 font-semibold text-sm">Date</th>
                          <th className="px-4 py-3 font-semibold text-sm text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map((sale) => (
                          <tr key={sale.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-mono text-[#2d4a5c]">#{sale.id}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(sale.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                              ${Number(sale.total_amount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
              
              <div className="mt-6 bg-[#34516A] rounded-lg p-6 flex justify-between">
                  <span className="text-white">Total Revenue</span>
                  <span className="text-white font-bold text-2xl">${totalRevenue.toFixed(2)}</span>
              </div>

            </div>
          </div>
          <button onClick={() => router.back()} className="mt-6 bg-[#4a6575] text-white p-3 rounded-full"><ArrowLeft /></button>
        </main>
      </div>
    </div>
  );
}