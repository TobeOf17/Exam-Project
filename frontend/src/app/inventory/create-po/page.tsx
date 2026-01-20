'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  InventorySidebar,
  InventoryHeader,
  PurchaseOrderTable,
  SupplierSelector,
  type PurchaseOrderItem,
} from '@/app/components/inventory';
import { useSupplierStore } from '@/app/store/supplierStore';
import { usePurchaseOrderStore } from '@/app/store/purchaseOrderStore';
import { useProductStore } from '@/app/store/productStore';

// Generate a unique Purchase Order ID
const generatePurchaseOrderId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timestamp = now.getTime().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `PO-${year}${month}${day}-${timestamp.slice(-4)}${randomPart}`;
};

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const suppliers = useSupplierStore((state) => state.suppliers);
  const fetchSuppliers = useSupplierStore((state) => state.fetchSuppliers);
  const addPurchaseOrder = usePurchaseOrderStore((state) => state.addPurchaseOrder);
  const products = useProductStore((state) => state.products);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const getProductByBarcode = useProductStore((state) => state.getProductByBarcode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastCreatedPoId, setLastCreatedPoId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([
    { barcode: '', productName: '', qtyNeeded: 0, unitPrice: 0 },
  ]);

  // Fetch suppliers and products on mount
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, [fetchSuppliers, fetchProducts]);

  // Get available products from the store (for the sidebar)
  const availableProducts = products.map((p) => ({
    barcode: p.barcode,
    productName: p.productName,
    unitPrice: p.purchasePrice,
  }));

  const calculateTotalAmount = () => {
    return poItems.reduce((total, item) => {
      return total + item.qtyNeeded * item.unitPrice;
    }, 0);
  };

  const handleUpdateItem = (index: number, updatedItem: PurchaseOrderItem) => {
    const newItems = [...poItems];

    // If barcode changed, try to auto-fill product info from store
    if (updatedItem.barcode && updatedItem.barcode !== poItems[index].barcode) {
      const product = getProductByBarcode(updatedItem.barcode);
      if (product) {
        updatedItem.productName = product.productName;
        updatedItem.unitPrice = product.purchasePrice;
      }
    }

    newItems[index] = updatedItem;
    setPoItems(newItems);
  };

  const handleAddRow = () => {
    setPoItems([
      ...poItems,
      { barcode: '', productName: '', qtyNeeded: 0, unitPrice: 0 },
    ]);
  };

  const handleAddItem = (item: PurchaseOrderItem) => {
    setPoItems([...poItems, item]);
  };

  const handleSelectProduct = (item: { barcode: string; productName: string; unitPrice?: number }) => {
    // Check if item already exists in the table
    const existingIndex = poItems.findIndex(
      (poItem) => poItem.barcode === item.barcode && poItem.barcode !== ''
    );

    // If item already exists, don't add it again
    if (existingIndex !== -1) {
      return;
    }

    // Get product price from store
    const product = getProductByBarcode(item.barcode);
    const unitPrice = product?.purchasePrice || item.unitPrice || 0;

    // Check if there's only one empty row
    const hasOnlyEmptyRow =
      poItems.length === 1 &&
      poItems[0].barcode === '' &&
      poItems[0].productName === '' &&
      poItems[0].qtyNeeded === 0 &&
      poItems[0].unitPrice === 0;

    if (hasOnlyEmptyRow) {
      // Replace the empty row with the selected item
      setPoItems([
        { barcode: item.barcode, productName: item.productName, qtyNeeded: 0, unitPrice },
      ]);
    } else {
      // Add as a new row
      setPoItems([
        ...poItems,
        { barcode: item.barcode, productName: item.productName, qtyNeeded: 0, unitPrice },
      ]);
    }
  };

  const handleCreateOrder = async () => {
    const validItems = poItems.filter(
      (item) => item.barcode && item.productName && item.qtyNeeded > 0
    );

    if (validItems.length === 0) {
      alert('Please add at least one product with quantity');
      return;
    }

    // Validate that all products exist in the store and get their SKU IDs
    const itemsWithSkuIds: { skuId: number; quantity: number; barcode: string }[] = [];
    const invalidProducts: string[] = [];

    for (const item of validItems) {
      const product = getProductByBarcode(item.barcode);
      if (product && product.skuId) {
        itemsWithSkuIds.push({
          skuId: product.skuId,
          quantity: item.qtyNeeded,
          barcode: item.barcode,
        });
      } else {
        invalidProducts.push(item.barcode);
      }
    }

    if (invalidProducts.length > 0) {
      alert(`The following products do not exist. Please create them first in Create P/S:\n${invalidProducts.join(', ')}`);
      return;
    }

    if (!selectedSupplierId) {
      alert('Please select a supplier');
      return;
    }

    setIsCreating(true);

    try {
      // Add purchase order via API
      const createdPO = await addPurchaseOrder({
        supplierId: parseInt(selectedSupplierId),
        items: itemsWithSkuIds.map(item => ({
          skuId: item.skuId,
          quantity: item.quantity,
        })),
      });

      setLastCreatedPoId(createdPO.id);

      console.log('Purchase Order created:', createdPO);

      // Show success message
      setShowSuccessMessage(true);

      // Reset form
      setPoItems([{ barcode: '', productName: '', qtyNeeded: 0, unitPrice: 0 }]);
      setSelectedSupplierId('');

      // Auto-hide message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <InventorySidebar />

      <div className="flex-1 flex flex-col">
        <InventoryHeader
          searchPlaceholder="Search Purchase Order"
          onSearch={setSearchQuery}
        />

        <main className="flex-1 p-6">
          <div className="flex gap-6">
            {/* Main content */}
            <div className="flex-1">
              <PurchaseOrderTable
                items={poItems}
                onUpdateItem={handleUpdateItem}
                onAddItem={handleAddItem}
              />

              {/* Total Amount and Create Order Button */}
              <div className="mt-6 bg-[#34516A] rounded-lg p-6 flex items-center justify-between">
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
                  {/* Success Message */}
                  {showSuccessMessage && (
                    <div className="bg-[#86efac] text-gray-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium">Order created and forwarded</span>
                        <span className="text-sm font-mono">{lastCreatedPoId}</span>
                      </div>
                      <button
                        onClick={() => setShowSuccessMessage(false)}
                        className="text-gray-700 hover:text-gray-900"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Create Order Button - Changes to green with checkmark when order is created */}
                  <button
                    onClick={handleCreateOrder}
                    disabled={isCreating}
                    className={`px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      showSuccessMessage
                        ? 'bg-[#4ade80] hover:bg-[#3bc670] text-white'
                        : 'bg-[#b8d4e8] hover:bg-[#a3c4db] text-[#2d4a5c]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isCreating ? (
                      'Creating...'
                    ) : showSuccessMessage ? (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Create Order
                        <ArrowLeft className="rotate-180" size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* Available Products */}
              <div className="bg-[#b8d4e8] rounded-lg p-4 min-w-[280px]">
                <h3 className="text-[#2d4a5c] font-semibold text-lg mb-4">Available Products</h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {availableProducts.length === 0 ? (
                    <p className="text-sm text-gray-600 text-center py-4">
                      No products available.<br />
                      Create products in Create P/S first.
                    </p>
                  ) : (
                    availableProducts.map((item) => (
                      <div
                        key={item.barcode}
                        onClick={() => handleSelectProduct(item)}
                        className="bg-white rounded p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-mono">{item.barcode}</p>
                          <p className="text-sm font-medium text-[#2d4a5c]">{item.productName}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProduct(item);
                          }}
                          className="bg-[#8fa9bc] hover:bg-[#7a96a8] text-white text-xs px-2 py-1 rounded"
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Supplier Selector */}
              <SupplierSelector
                suppliers={suppliers}
                selectedSupplierId={selectedSupplierId}
                onSelectSupplier={setSelectedSupplierId}
              />
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
