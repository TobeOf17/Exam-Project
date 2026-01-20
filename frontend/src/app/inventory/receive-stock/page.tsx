'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  InventorySidebar,
  InventoryHeader,
  ReceiveStockTable,
  type ReceiveStockItem,
} from '@/app/components/inventory';
import { useReceiveStockStore } from '@/app/store/receiveStockStore';
import { usePurchaseOrderStore } from '@/app/store/purchaseOrderStore';
import { useInventoryStore } from '@/app/store/inventoryStore';
import { useProductStore } from '@/app/store/productStore';

// Generate a unique Receive Stock ID
const generateReceiveStockId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timestamp = now.getTime().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `RS-${year}${month}${day}-${timestamp.slice(-4)}${randomPart}`;
};

export default function ReceiveStockPage() {
  const router = useRouter();
  const addReceivedStock = useReceiveStockStore((state) => state.addReceivedStock);
  const purchaseOrders = usePurchaseOrderStore((state) => state.purchaseOrders);
  const fetchPurchaseOrders = usePurchaseOrderStore((state) => state.fetchPurchaseOrders);
  const fetchInventory = useInventoryStore((state) => state.fetchInventory);
  const fetchStores = useInventoryStore((state) => state.fetchStores);
  const stores = useInventoryStore((state) => state.stores);
  const currentStoreId = useInventoryStore((state) => state.currentStoreId);
  const getProductByBarcode = useProductStore((state) => state.getProductByBarcode);
  const searchProducts = useProductStore((state) => state.searchProducts);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadedPoId, setLoadedPoId] = useState('');
  const [showWarning, setShowWarning] = useState(true);
  const [setPrice, setSetPrice] = useState('24500.00');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastCreatedRsId, setLastCreatedRsId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [receiveItems, setReceiveItems] = useState<ReceiveStockItem[]>([]);

  // Fetch data on mount
  useEffect(() => {
    fetchPurchaseOrders();
    fetchProducts();
    fetchStores();
  }, [fetchPurchaseOrders, fetchProducts, fetchStores]);

  // Search for a purchase order by ID and load its items
  const handleSearchPO = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      return;
    }

    // Find the purchase order by ID (case-insensitive partial match)
    const foundPO = purchaseOrders.find((po) =>
      po.id.toLowerCase().includes(query.toLowerCase())
    );

    if (foundPO) {
      // Convert PO items to ReceiveStockItem format
      const items: ReceiveStockItem[] = foundPO.items.map((item) => ({
        barcode: item.barcode,
        productName: item.productName,
        qtyPurchased: item.qtyNeeded,
        qtyDelivered: 0, // Default to 0, manager will fill in actual delivered qty
        unitPrice: item.unitPrice,
        skuId: item.skuId,
      }));

      setReceiveItems(items);
      setLoadedPoId(foundPO.id);
    }
  };

  const handleUpdateItem = (index: number, updatedItem: ReceiveStockItem) => {
    const newItems = [...receiveItems];
    newItems[index] = updatedItem;
    setReceiveItems(newItems);
  };

  const handleAddItem = (item: ReceiveStockItem) => {
    setReceiveItems([...receiveItems, item]);
  };

  // Add product from search to table
  const handleAddProductFromSearch = (product: { barcode: string; productName: string; purchasePrice: number; skuId: number }) => {
    // Check if product already exists in table
    const existingIndex = receiveItems.findIndex((item) => item.barcode === product.barcode);
    if (existingIndex !== -1) {
      return; // Product already in table
    }

    // Add new product to table
    const newItem: ReceiveStockItem = {
      barcode: product.barcode,
      productName: product.productName,
      qtyPurchased: 0,
      qtyDelivered: 0,
      unitPrice: product.purchasePrice,
      skuId: product.skuId,
    };

    setReceiveItems([...receiveItems, newItem]);
  };

  const calculateTotalAmount = () => {
    return receiveItems.reduce((total, item) => {
      return total + item.unitPrice * item.qtyDelivered;
    }, 0);
  };

  const hasDiscrepancies = () => {
    return receiveItems.some((item) => item.qtyPurchased !== item.qtyDelivered);
  };

  const handleSaveAsDraft = () => {
    // TODO: API call to save as draft
    console.log('Saving as draft:', receiveItems);
    alert('Saved as draft');
  };

  const handleSave = async () => {
    // Validate that there are items to save
    const validItems = receiveItems.filter(
      (item) => item.barcode && item.productName && item.qtyDelivered > 0 && item.skuId
    );

    if (validItems.length === 0) {
      alert('Please add at least one product with delivered quantity');
      return;
    }

    if (hasDiscrepancies()) {
      const confirmSave = confirm(
        'There are discrepancies between purchased and delivered quantities. Do you want to continue?'
      );
      if (!confirmSave) return;
    }

    // Check if we have a store selected
    const storeId = currentStoreId || (stores.length > 0 ? stores[0].id : null);
    if (!storeId) {
      alert('No store available. Please create a store first.');
      return;
    }

    setIsSaving(true);

    try {
      // Add to receive stock store (this will update inventory via API)
      const receivedStock = await addReceivedStock({
        linkedPoId: loadedPoId || undefined,
        items: validItems.map(item => ({
          barcode: item.barcode,
          productName: item.productName,
          qtyPurchased: item.qtyPurchased,
          qtyDelivered: item.qtyDelivered,
          unitPrice: item.unitPrice,
          skuId: item.skuId!,
        })),
        totalAmount: calculateTotalAmount(),
        storeId: storeId,
      });

      setLastCreatedRsId(receivedStock.id);

      console.log('Receive Stock ID:', receivedStock.id);
      console.log('Updating inventory with:', validItems);
      console.log('Total Amount:', calculateTotalAmount());

      // Refresh inventory
      await fetchInventory(storeId);

      // Show success message
      setShowSuccessMessage(true);

      // Reset form
      setReceiveItems([]);
      setLoadedPoId('');
      setSearchQuery('');

      // Auto-hide message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving received stock:', error);
      alert('Failed to save received stock. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <InventorySidebar />

      <div className="flex-1 flex flex-col">
        <InventoryHeader
          searchPlaceholder="Enter Purchase Order ID (e.g., PO-20260116-XXXX)"
          onSearch={handleSearchPO}
        />

        <main className="flex-1 p-6">
          {/* Loaded PO Info */}
          {loadedPoId && (
            <div className="mb-4 bg-[#b8d4e8] text-[#2d4a5c] px-6 py-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-medium">Loaded Purchase Order: </span>
                <span className="font-mono">{loadedPoId}</span>
              </div>
              <button
                onClick={() => {
                  setLoadedPoId('');
                  setReceiveItems([]);
                  setSearchQuery('');
                }}
                className="text-[#2d4a5c] hover:text-[#1a3a4c]"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Receive Stock Table */}
          <ReceiveStockTable
            items={receiveItems}
            onUpdateItem={handleUpdateItem}
            onAddItem={handleAddItem}
            searchProducts={searchProducts}
            onAddProductFromSearch={handleAddProductFromSearch}
          />

          {/* Warning Message */}
          {showWarning && hasDiscrepancies() && (
            <div className="mt-4 bg-[#d9a5a5] text-[#5c2d2d] px-6 py-3 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">
                Review quantities before saving
              </span>
              <button
                onClick={() => setShowWarning(false)}
                className="text-[#5c2d2d] hover:text-red-900"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Total Amount and Action Buttons */}
          <div className="mt-6 bg-[#34516A] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-[#4a6575] px-6 py-3 rounded-lg">
                  <span className="text-white text-sm font-medium">Total Amount</span>
                </div>
                <div className="bg-[#4a6575] px-6 py-3 rounded-lg min-w-[150px] text-center">
                  <span className="text-white text-lg font-semibold">
                    {calculateTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-[#4a6575] px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="text-white text-sm">Set Price :</span>
                  <input
                    type="number"
                    value={setPrice}
                    onChange={(e) => setSetPrice(e.target.value)}
                    placeholder="24500.00"
                    className="bg-white text-[#2d4a5c] px-3 py-1 rounded w-32 text-sm"
                  />
                  <button className="bg-[#6b92ab] hover:bg-[#5a7f99] text-white px-3 py-1 rounded text-sm font-medium">
                    ₦
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              {/* Success Message */}
              {showSuccessMessage && (
                <div className="bg-[#86efac] text-gray-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="font-medium">Stock received and saved</span>
                    <span className="text-sm font-mono">{lastCreatedRsId}</span>
                  </div>
                  <button
                    onClick={() => setShowSuccessMessage(false)}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <button
                onClick={handleSaveAsDraft}
                className="bg-[#6b92ab] hover:bg-[#5a7f99] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Save as Draft
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  showSuccessMessage
                    ? 'bg-[#4ade80] hover:bg-[#3bc670] text-white'
                    : 'bg-[#b8d4e8] hover:bg-[#a3c4db] text-[#2d4a5c]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSaving ? (
                  'Saving...'
                ) : showSuccessMessage ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <>
                    Save
                    <ArrowLeft className="rotate-180" size={20} />
                  </>
                )}
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
