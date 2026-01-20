'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  InventorySidebar,
  InventoryHeader,
  PurchaseOrderTable,
  LowStockAlert,
  SupplierSelector,
  type PurchaseOrderItem,
} from '@/app/components/inventory';
import { usePurchaseOrderStore } from '@/app/store/purchaseOrderStore';

// Helper for ID generation
const generatePurchaseOrderId = (): string => {
  const now = new Date();
  return `PO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${now.getTime().toString().slice(-4)}`;
};

// Type for our Product Dictionary (for Auto-fill)
interface ProductInfo {
  id: number;
  name: string;
  price: number;
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const addPurchaseOrder = usePurchaseOrderStore((state) => state.addPurchaseOrder);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastCreatedPoId, setLastCreatedPoId] = useState<string>('');
  
  // REAL DATA STATES
  const [suppliersList, setSuppliersList] = useState<any[]>([]); 
  const [productMap, setProductMap] = useState<Record<string, ProductInfo>>({}); 
  const [loadingData, setLoadingData] = useState(true);

  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([
    { barcode: '', productName: '', qtyNeeded: 0, unitPrice: 0 },
  ]);

  // Mock low stock items (Visual placeholder)
  const lowStockItems = [
    { barcode: '0079', productName: 'Test Apple' }, 
    { barcode: '0087', productName: 'Test Ball' },
  ];

  // 1. FETCH DATA ON LOAD
  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem("access");
      if (!token) return; 

      try {
        // A. Fetch Suppliers
        const supRes = await fetch('http://127.0.0.1:8000/api/suppliers/', {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (supRes.ok) {
          const supData = await supRes.json();
          // HANDLE PAGINATION (results vs array)
          const rawSuppliers = Array.isArray(supData) ? supData : supData.results || [];
          
          // MAP BACKEND DATA TO FRONTEND INTERFACE
          const mappedSuppliers = rawSuppliers.map((s: any) => ({
            id: s.id.toString(),
            name: s.name || s.company_name || "Unknown",
            // Component expects 'contact', backend sends 'contact_info'
            contact: s.contact_info || s.contact || "No Contact Info"
          }));
          
          setSuppliersList(mappedSuppliers);
        }

        // B. Fetch Products (To build Auto-Fill Map)
        const skuRes = await fetch('http://127.0.0.1:8000/api/skus/', {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (skuRes.ok) {
          const skuData = await skuRes.json();
          const rawProducts = Array.isArray(skuData) ? skuData : skuData.results || [];
          
          const map: Record<string, ProductInfo> = {};
          
          rawProducts.forEach((item: any) => {
            const info = {
              id: item.id,
              name: item.product_name || item.product?.name || "Unknown",
              price: parseFloat(item.base_price || item.price || "0")
            };
            // Map both keys for safety
            if (item.barcode) map[item.barcode] = info;
            if (item.sku_code) map[item.sku_code] = info;
          });
          setProductMap(map);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoadingData(false);
      }
    };

    initData();
  }, []);

  const calculateTotalAmount = () => {
    return poItems.reduce((total, item) => {
      return total + item.qtyNeeded * item.unitPrice;
    }, 0);
  };

  // 2. AUTO-FILL LOGIC (When editing a row)
  const handleUpdateItem = (index: number, updatedItem: PurchaseOrderItem) => {
    const newItems = [...poItems];
    
    // If barcode exists in our map, auto-fill the details
    const barcode = updatedItem.barcode;
    if (barcode && productMap[barcode]) {
       const product = productMap[barcode];
       // Only fill if empty or mismatch to avoid annoying the user
       if (updatedItem.productName !== product.name || updatedItem.unitPrice === 0) {
           updatedItem.productName = product.name;
           updatedItem.unitPrice = product.price;
       }
    }

    newItems[index] = updatedItem;
    setPoItems(newItems);
  };

  // 3. AUTO-FILL LOGIC (When adding a new row)
  const handleAddItem = (item: PurchaseOrderItem) => {
    // Check map immediately upon adding
    if (item.barcode && productMap[item.barcode]) {
        const product = productMap[item.barcode];
        item.productName = product.name;
        item.unitPrice = product.price;
    }
    setPoItems([...poItems, item]);
  };

  const handleSelectLowStockItem = (item: { barcode: string; productName: string }) => {
    const existingIndex = poItems.findIndex(
      (poItem) => poItem.barcode === item.barcode && poItem.barcode !== ''
    );
    if (existingIndex !== -1) return;

    const hasOnlyEmptyRow = poItems.length === 1 && poItems[0].barcode === '';
    
    let price = 0;
    if (productMap[item.barcode]) price = productMap[item.barcode].price;

    const newItem = { barcode: item.barcode, productName: item.productName, qtyNeeded: 1, unitPrice: price };

    if (hasOnlyEmptyRow) {
      setPoItems([newItem]);
    } else {
      setPoItems([...poItems, newItem]);
    }
  };

  const handleCreateOrder = async () => {
    const token = localStorage.getItem("access");
    
    const validItems = poItems.filter(
      (item) => item.barcode && item.qtyNeeded > 0
    );

    if (validItems.length === 0) {
      alert('Please add at least one product with quantity');
      return;
    }

    if (!selectedSupplierId) {
      alert('Please select a supplier');
      return;
    }

    // 4. PREPARE PAYLOAD FOR BACKEND
    const lines = validItems.map(item => {
        const productInfo = productMap[item.barcode];
        // If auto-filled, use ID from map. If manually typed, try to parse barcode as ID.
        const skuId = productInfo ? productInfo.id : parseInt(item.barcode);
        
        return {
            sku: skuId,
            quantity: Number(item.qtyNeeded)
        };
    });

    if (lines.some(line => !line.sku || isNaN(line.sku))) {
        alert("Error: One or more products not found in database. Please check Barcodes.");
        return;
    }

    const payload = {
        supplier: parseInt(selectedSupplierId),
        status: "PENDING", // Initial status
        lines: lines
    };

    try {
        const res = await fetch('http://127.0.0.1:8000/api/purchase-orders/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            const poId = generatePurchaseOrderId(); // Generate pretty ID for display
            setLastCreatedPoId(poId);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
            
            // Optional: Reset table
            // setPoItems([{ barcode: '', productName: '', qtyNeeded: 0, unitPrice: 0 }]);
        } else {
            console.error(data);
            alert("Failed to create PO: " + JSON.stringify(data));
        }

    } catch (error) {
        console.error("Network Error", error);
        alert("Network Error: Backend not reachable");
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
            <div className="flex-1">
              <PurchaseOrderTable
                items={poItems}
                onUpdateItem={handleUpdateItem}
                onAddItem={handleAddItem}
              />

              <div className="mt-6 bg-[#34516A] rounded-lg p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#4a6575] px-6 py-3 rounded-lg">
                    <span className="text-white text-sm font-medium">Total Amount (Est)</span>
                  </div>
                  <div className="bg-[#4a6575] px-6 py-3 rounded-lg min-w-[150px] text-center">
                    <span className="text-white text-lg font-semibold">
                      {calculateTotalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {showSuccessMessage && (
                    <div className="bg-[#86efac] text-gray-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium">Order sent to Backend</span>
                        <span className="text-sm font-mono">{lastCreatedPoId}</span>
                      </div>
                      <button onClick={() => setShowSuccessMessage(false)} className="text-gray-700 hover:text-gray-900">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleCreateOrder}
                    className={`px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      showSuccessMessage
                        ? 'bg-[#4ade80] hover:bg-[#3bc670] text-white'
                        : 'bg-[#b8d4e8] hover:bg-[#a3c4db] text-[#2d4a5c]'
                    }`}
                  >
                    {showSuccessMessage ? (
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

            <div className="space-y-4">
              <LowStockAlert items={lowStockItems} onSelectItem={handleSelectLowStockItem} />

              <SupplierSelector
                suppliers={suppliersList}
                selectedSupplierId={selectedSupplierId}
                onSelectSupplier={setSelectedSupplierId}
              />
            </div>
          </div>

          <button onClick={() => router.back()} className="mt-6 bg-[#4a6575] hover:bg-[#3d5a6c] text-white p-3 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
        </main>
      </div>
    </div>
  );
}