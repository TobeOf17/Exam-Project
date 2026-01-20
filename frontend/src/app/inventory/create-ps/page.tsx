'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  InventorySidebar,
  InventoryHeader,
  NotificationsPanel,
  type Notification,
} from '@/app/components/inventory';
import { useSupplierStore } from '@/app/store/supplierStore';
import { useProductStore } from '@/app/store/productStore';

type FormMode = 'Create New Product' | 'Create New Supplier';

export default function CreateProductSupplierPage() {
  const router = useRouter();
  const addSupplier = useSupplierStore((state) => state.addSupplier);
  const createProductWithSKU = useProductStore((state) => state.createProductWithSKU);
  const getProductByBarcode = useProductStore((state) => state.getProductByBarcode);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState<FormMode>('Create New Product');
  const [showDropdown, setShowDropdown] = useState(false);

  // Product form fields
  const [barcode, setBarcode] = useState('');
  const [productName, setProductName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');

  // Supplier form fields
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierProducts, setSupplierProducts] = useState([
    { barcode: '83464569', name: 'PRODUCT 8' },
    { barcode: '44575676', name: 'PRODUCT 7' },
  ]);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'low_stock',
      message: 'Low stock alert !',
      productCode: 'PRODUCT2',
    },
    {
      id: '2',
      type: 'low_stock',
      message: 'Low stock alert !',
      productCode: 'PRODUCT34',
    },
    {
      id: '3',
      type: 'refund',
      message: 'Refund Request',
      productCode: 'ORDER12121',
    },
  ]);

  const handleDismissNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleSelectOption = (option: FormMode) => {
    setSelectedOption(option);
    setShowDropdown(false);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!barcode || !productName || !purchasePrice || !sellingPrice) {
      alert('Please fill in all fields');
      return;
    }

    // Check if product with barcode already exists
    const existingProduct = getProductByBarcode(barcode);
    if (existingProduct) {
      alert(`A product with barcode "${barcode}" already exists!`);
      return;
    }

    setIsCreating(true);

    try {
      // Create product via API
      await createProductWithSKU({
        name: productName,
        barcode: barcode,
        skuCode: `SKU-${barcode}`,
        basePrice: parseFloat(purchasePrice),
      });

      console.log('Product created successfully');
      alert(`Product "${productName}" created successfully!`);

      // Clear form
      setBarcode('');
      setProductName('');
      setPurchasePrice('');
      setSellingPrice('');
    } catch (error) {
      console.error('Error creating product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product. Please try again.';
      alert(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierName || !supplierContact) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    try {
      // Create supplier via API
      const newSupplier = await addSupplier({
        name: supplierName,
        contact: supplierContact,
      });

      console.log('Supplier created:', newSupplier);
      alert(`Supplier "${supplierName}" created successfully!`);

      // Clear form
      setSupplierId('');
      setSupplierName('');
      setSupplierContact('');
    } catch (error) {
      console.error('Error creating supplier:', error);
      alert('Failed to create supplier. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <InventorySidebar />

      <div className="flex-1 flex flex-col">
        <InventoryHeader searchPlaceholder="" onSearch={setSearchQuery} />

        <main className="flex-1 p-6">
          <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1">
              {/* Dropdown Menu */}
              <div className="relative mb-6 max-w-4xl">
                <div
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-[#34516A] rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-[#2d4a5c] transition-colors"
                >
                  <span className="text-white font-semibold text-lg">
                    {selectedOption}
                  </span>
                  <ChevronDown size={24} className="text-white" />
                </div>

                {/* Dropdown Options */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-10">
                    <div
                      onClick={() => handleSelectOption('Create New Product')}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer rounded-t-lg text-[#2d4a5c] font-medium"
                    >
                      Create New Product
                    </div>
                    <div
                      onClick={() => handleSelectOption('Create New Supplier')}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer rounded-b-lg text-[#2d4a5c] font-medium border-t"
                    >
                      Create New Supplier
                    </div>
                  </div>
                )}
              </div>

              {/* Product Form */}
              {selectedOption === 'Create New Product' && (
                <form onSubmit={handleCreateProduct}>
                  <div className="bg-[#8fa9bc] rounded-lg p-8 max-w-4xl">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[#2d4a5c] text-sm font-medium mb-2">
                          Enter Product Barcode
                        </label>
                        <input
                          type="text"
                          value={barcode}
                          onChange={(e) => setBarcode(e.target.value)}
                          placeholder="162638236"
                          className="w-full px-4 py-3 rounded-lg border-none bg-white text-[#2d4a5c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34516A]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#2d4a5c] text-sm font-medium mb-2">
                          Enter Product Name
                        </label>
                        <input
                          type="text"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder="PRODUCT 82"
                          className="w-full px-4 py-3 rounded-lg border-none bg-white text-[#2d4a5c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34516A]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#2d4a5c] text-sm font-medium mb-2">
                          Enter Purchase Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(e.target.value)}
                          placeholder="550.00"
                          className="w-full px-4 py-3 rounded-lg border-none bg-white text-[#2d4a5c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34516A]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#2d4a5c] text-sm font-medium mb-2">
                          Set Selling Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={sellingPrice}
                          onChange={(e) => setSellingPrice(e.target.value)}
                          placeholder="600.00"
                          className="w-full px-4 py-3 rounded-lg border-none bg-white text-[#2d4a5c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34516A]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full bg-[#b8d4e8] hover:bg-[#a3c4db] text-[#2d4a5c] py-3 rounded-lg font-semibold transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreating ? 'Creating...' : 'Create Product'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Supplier Form */}
              {selectedOption === 'Create New Supplier' && (
                <form onSubmit={handleCreateSupplier}>
                  <div className="bg-[#8fa9bc] rounded-lg p-8 max-w-4xl">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[#2d4a5c] text-sm font-medium mb-2">
                          Enter Supplier ID
                        </label>
                        <input
                          type="text"
                          value={supplierId}
                          onChange={(e) => setSupplierId(e.target.value)}
                          placeholder="62348732"
                          className="w-full px-4 py-3 rounded-lg border-none bg-white text-[#2d4a5c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34516A]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#2d4a5c] text-sm font-medium mb-2">
                          Enter Supplier Name
                        </label>
                        <input
                          type="text"
                          value={supplierName}
                          onChange={(e) => setSupplierName(e.target.value)}
                          placeholder="Supplier 63"
                          className="w-full px-4 py-3 rounded-lg border-none bg-white text-[#2d4a5c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34516A]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#2d4a5c] text-sm font-medium mb-2">
                          Enter Supplier Contact Details
                        </label>
                        <input
                          type="text"
                          value={supplierContact}
                          onChange={(e) => setSupplierContact(e.target.value)}
                          placeholder="+234 09 9458 2548"
                          className="w-full px-4 py-3 rounded-lg border-none bg-white text-[#2d4a5c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34516A]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#2d4a5c] text-sm font-medium mb-2">
                          Add Supplier Products
                        </label>
                        <div className="bg-white rounded-lg p-4 space-y-3">
                          {supplierProducts.map((product, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 py-2 border-b last:border-b-0"
                            >
                              <input
                                type="text"
                                value={product.barcode}
                                onChange={(e) => {
                                  const updated = [...supplierProducts];
                                  updated[index].barcode = e.target.value;
                                  setSupplierProducts(updated);
                                }}
                                placeholder="Barcode"
                                className="flex-1 px-3 py-2 rounded border border-gray-300 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#34516A]"
                              />
                              <input
                                type="text"
                                value={product.name}
                                onChange={(e) => {
                                  const updated = [...supplierProducts];
                                  updated[index].name = e.target.value;
                                  setSupplierProducts(updated);
                                }}
                                placeholder="Product Name"
                                className="flex-1 px-3 py-2 rounded border border-gray-300 text-sm font-medium text-[#2d4a5c] focus:outline-none focus:ring-2 focus:ring-[#34516A]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full bg-[#b8d4e8] hover:bg-[#a3c4db] text-[#2d4a5c] py-3 rounded-lg font-semibold transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreating ? 'Creating...' : 'Create Supplier'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Right Sidebar - Notifications */}
            <NotificationsPanel
              notifications={notifications}
              onDismiss={handleDismissNotification}
            />
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
