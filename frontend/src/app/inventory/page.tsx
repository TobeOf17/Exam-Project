'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { InventorySidebar, InventoryHeader, type DropdownOption } from '@/app/components/inventory';
import { usePurchaseOrderStore } from '@/app/store/purchaseOrderStore';
import { useReceiveStockStore } from '@/app/store/receiveStockStore';

interface InventoryItem {
  barcode: string;
  productName: string;
  qtyNeeded: number;
  unitPrice: number;
}

const DROPDOWN_OPTIONS: DropdownOption[] = [
  { value: 'purchase_order', label: 'Load Previously Purchased Order' },
  { value: 'received_stock', label: 'Load Previously Received Stock' },
];

export default function InventoryListPage() {
  const router = useRouter();
  const [dateSearch, setDateSearch] = useState('');
  const [loadedId, setLoadedId] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('purchase_order');

  // Purchase orders from store
  const purchaseOrders = usePurchaseOrderStore((state) => state.purchaseOrders);
  const togglePurchaseOrder = usePurchaseOrderStore((state) => state.togglePurchaseOrder);
  const fetchPurchaseOrders = usePurchaseOrderStore((state) => state.fetchPurchaseOrders);
  const isLoadingPO = usePurchaseOrderStore((state) => state.isLoading);

  // Received stocks from store
  const receivedStocks = useReceiveStockStore((state) => state.receivedStocks);
  const [selectedReceivedStocks, setSelectedReceivedStocks] = useState<Set<string>>(new Set());

  // Fetch purchase orders on mount
  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // Inventory items from loaded order
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const calculateTotalAmount = () => {
    return inventoryItems.reduce((total, item) => {
      return total + item.qtyNeeded * item.unitPrice;
    }, 0);
  };

  const handleTogglePO = (id: string) => {
    togglePurchaseOrder(id);
  };

  const handleToggleRS = (id: string) => {
    setSelectedReceivedStocks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleModeChange = (value: string) => {
    setSelectedMode(value);
    // Clear loaded items when switching modes
    setInventoryItems([]);
    setLoadedId('');
  };

  const handleLoadOrder = () => {
    if (selectedMode === 'purchase_order') {
      // Load Purchase Orders
      const selectedPOs = purchaseOrders.filter((po) => po.selected);
      if (selectedPOs.length === 0) {
        alert('Please select at least one purchase order');
        return;
      }

      const allItems: InventoryItem[] = [];
      const poIds: string[] = [];

      selectedPOs.forEach((po) => {
        poIds.push(po.id);
        po.items.forEach((item) => {
          const existingIndex = allItems.findIndex((i) => i.barcode === item.barcode);
          if (existingIndex !== -1) {
            allItems[existingIndex].qtyNeeded += item.qtyNeeded;
          } else {
            allItems.push({
              barcode: item.barcode,
              productName: item.productName,
              qtyNeeded: item.qtyNeeded,
              unitPrice: item.unitPrice,
            });
          }
        });
      });

      setInventoryItems(allItems);
      setLoadedId(poIds.join(', '));
      console.log('Loaded purchase orders:', selectedPOs);
    } else {
      // Load Received Stocks
      const selectedRSList = receivedStocks.filter((rs) => selectedReceivedStocks.has(rs.id));
      if (selectedRSList.length === 0) {
        alert('Please select at least one received stock');
        return;
      }

      const allItems: InventoryItem[] = [];
      const rsIds: string[] = [];

      selectedRSList.forEach((rs) => {
        rsIds.push(rs.id);
        rs.items.forEach((item) => {
          const existingIndex = allItems.findIndex((i) => i.barcode === item.barcode);
          if (existingIndex !== -1) {
            allItems[existingIndex].qtyNeeded += item.qtyDelivered;
          } else {
            allItems.push({
              barcode: item.barcode,
              productName: item.productName,
              qtyNeeded: item.qtyDelivered,
              unitPrice: item.unitPrice,
            });
          }
        });
      });

      setInventoryItems(allItems);
      setLoadedId(rsIds.join(', '));
      console.log('Loaded received stocks:', selectedRSList);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <InventorySidebar />

      <div className="flex-1 flex flex-col">
        <InventoryHeader
          dropdownMode={true}
          dropdownOptions={DROPDOWN_OPTIONS}
          selectedOption={selectedMode}
          onOptionChange={handleModeChange}
        />

        <main className="flex-1 p-6">
          <div className="flex gap-6">
            {/* Main Content - Inventory History */}
            <div className="flex-1">
              <div className="bg-[#a8c5d8] rounded-lg p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[#2d4a5c] font-semibold text-lg">
                      {loadedId
                        ? (selectedMode === 'purchase_order' ? 'Purchase Order Items' : 'Received Stock Items')
                        : 'Inventory History'}
                    </h2>
                    {loadedId && (
                      <p className="text-[#2d4a5c] text-sm font-mono">{loadedId}</p>
                    )}
                  </div>
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

                {/* Inventory Table */}
                <div className="bg-white rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#8fa9bc] text-[#2d4a5c]">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Barcode
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Product name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          {selectedMode === 'purchase_order' ? 'Qty needed' : 'Qty available'}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Unit price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                            Select a purchase order and click "Load Order" to view items
                          </td>
                        </tr>
                      ) : (
                        inventoryItems.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">{item.barcode}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="bg-[#6b8fa3] text-white px-3 py-1 rounded">
                                {item.qtyNeeded}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.unitPrice.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                      {/* Empty rows */}
                      {inventoryItems.length > 0 && Array.from({ length: Math.max(0, 6 - inventoryItems.length) }).map(
                        (_, i) => (
                          <tr key={`empty-${i}`} className="border-b border-gray-200">
                            <td className="px-4 py-3 h-12"></td>
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3"></td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Amount */}
              <div className="mt-6 bg-[#34516A] rounded-lg p-6 flex items-center gap-4">
                <div className="bg-[#4a6575] px-6 py-3 rounded-lg">
                  <span className="text-white text-sm font-medium">Total Amount</span>
                </div>
                <div className="bg-[#4a6575] px-6 py-3 rounded-lg min-w-[150px] text-center">
                  <span className="text-white text-lg font-semibold">
                    {calculateTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Purchase Orders or Received Stocks */}
            <div className="bg-[#b8d4e8] rounded-lg p-6 min-w-[280px] h-fit">
              <h3 className="text-[#2d4a5c] font-semibold text-lg mb-4">
                {selectedMode === 'purchase_order' ? 'Purchase Order' : 'Received Stock'}
              </h3>

              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                {selectedMode === 'purchase_order' ? (
                  // Purchase Orders List
                  purchaseOrders.length === 0 ? (
                    <div className="bg-white rounded-lg p-4 text-center text-gray-500 text-sm">
                      No purchase orders yet
                    </div>
                  ) : (
                    purchaseOrders.map((po) => (
                      <div
                        key={po.id}
                        className="bg-white rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                        onClick={() => handleTogglePO(po.id)}
                      >
                        <span className="text-sm text-[#2d4a5c] font-medium font-mono">
                          {po.id}
                        </span>
                        <input
                          type="checkbox"
                          checked={po.selected}
                          onChange={() => handleTogglePO(po.id)}
                          className="w-4 h-4"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    ))
                  )
                ) : (
                  // Received Stocks List
                  receivedStocks.length === 0 ? (
                    <div className="bg-white rounded-lg p-4 text-center text-gray-500 text-sm">
                      No received stocks yet
                    </div>
                  ) : (
                    receivedStocks.map((rs) => (
                      <div
                        key={rs.id}
                        className="bg-white rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                        onClick={() => handleToggleRS(rs.id)}
                      >
                        <span className="text-sm text-[#2d4a5c] font-medium font-mono">
                          {rs.id}
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedReceivedStocks.has(rs.id)}
                          onChange={() => handleToggleRS(rs.id)}
                          className="w-4 h-4"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    ))
                  )
                )}
              </div>

              <button
                onClick={handleLoadOrder}
                className="w-full bg-[#8fa9bc] hover:bg-[#7a96a8] text-[#2d4a5c] py-3 rounded-lg font-semibold transition-colors"
              >
                Load Order
              </button>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mt-6 bg-[#4a6575] hover:bg-[#3d5a6c] text-white p-3 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        </main>
      </div>
    </div>
  );
}
