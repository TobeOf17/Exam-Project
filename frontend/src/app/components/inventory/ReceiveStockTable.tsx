'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export interface ReceiveStockItem {
  barcode: string;
  productName: string;
  qtyPurchased: number;
  qtyDelivered: number;
  unitPrice: number;
  skuId?: number;
}

interface ProductSearchResult {
  barcode: string;
  productName: string;
  purchasePrice: number;
  sellingPrice: number;
  skuId: number;
}

interface ReceiveStockTableProps {
  items: ReceiveStockItem[];
  onUpdateItem?: (index: number, item: ReceiveStockItem) => void;
  onAddItem?: (item: ReceiveStockItem) => void;
  searchProducts?: (query: string) => ProductSearchResult[];
  onAddProductFromSearch?: (product: { barcode: string; productName: string; purchasePrice: number; skuId: number }) => void;
  minRows?: number;
}

export default function ReceiveStockTable({
  items,
  onUpdateItem,
  onAddItem,
  searchProducts,
  onAddProductFromSearch,
  minRows = 6,
}: ReceiveStockTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<ProductSearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // State for empty editable rows
  const [emptyRows, setEmptyRows] = useState<ReceiveStockItem[]>([]);

  // Update empty rows when items change
  useEffect(() => {
    const currentEmptyCount = Math.max(0, minRows - items.length);
    setEmptyRows(
      Array.from({ length: currentEmptyCount }, () => ({
        barcode: '',
        productName: '',
        qtyPurchased: 0,
        qtyDelivered: 0,
        unitPrice: 0,
      }))
    );
  }, [items.length, minRows]);

  const handleEmptyRowChange = (rowIndex: number, field: keyof ReceiveStockItem, value: string | number) => {
    const updatedRows = [...emptyRows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [field]: value,
    };
    setEmptyRows(updatedRows);

    // If any field has a value, add this row to items
    const row = updatedRows[rowIndex];
    if (row.barcode || row.productName || row.qtyPurchased > 0 || row.qtyDelivered > 0 || row.unitPrice > 0) {
      onAddItem?.(row);
    }
  };

  const calculateDifference = (purchased: number, delivered: number) => {
    return purchased - delivered;
  };

  const calculateTotalPrice = (unitPrice: number, qtyDelivered: number) => {
    return (unitPrice * qtyDelivered).toFixed(2);
  };

  // Handle product search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && searchProducts) {
      const results = searchProducts(query);
      setProductSearchResults(results);
      setShowSearchResults(true);
    } else {
      setProductSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Handle adding product from search
  const handleSelectProduct = (product: ProductSearchResult) => {
    onAddProductFromSearch?.({
      barcode: product.barcode,
      productName: product.productName,
      purchasePrice: product.purchasePrice,
      skuId: product.skuId,
    });
    setSearchQuery('');
    setProductSearchResults([]);
    setShowSearchResults(false);
  };

  const displayItems = items;

  return (
    <div className="bg-[#a8c5d8] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#2d4a5c] font-semibold text-lg">Inventory</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search product by barcode or name..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-md border-none bg-white text-sm text-gray-900 placeholder-gray-400 w-72 focus:outline-none focus:ring-2 focus:ring-[#34516A]"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />

          {/* Product Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full mt-1 right-0 w-72 bg-white rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              {productSearchResults.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  No products found. Create products in Create P/S first.
                </div>
              ) : (
                productSearchResults.map((product) => (
                  <div
                    key={product.barcode}
                    onClick={() => handleSelectProduct(product)}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{product.productName}</p>
                        <p className="text-xs text-gray-500 font-mono">{product.barcode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">{product.purchasePrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#8fa9bc] text-[#2d4a5c]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Barcode</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Product name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Qty purchased</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Qty delivered</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Difference</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Unit price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Total price</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item, index) => {
              const difference = calculateDifference(item.qtyPurchased, item.qtyDelivered);
              const totalPrice = calculateTotalPrice(item.unitPrice, item.qtyDelivered);
              const originalIndex = items.indexOf(item);

              return (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.barcode}
                      onChange={(e) =>
                        onUpdateItem?.(originalIndex, { ...item, barcode: e.target.value })
                      }
                      placeholder="Enter barcode"
                      className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) =>
                        onUpdateItem?.(originalIndex, { ...item, productName: e.target.value })
                      }
                      placeholder="Enter product name"
                      className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.qtyPurchased || ''}
                      onChange={(e) =>
                        onUpdateItem?.(originalIndex, { ...item, qtyPurchased: parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="w-full text-center bg-transparent text-sm text-gray-900 placeholder-gray-400"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.qtyDelivered || ''}
                      onChange={(e) =>
                        onUpdateItem?.(originalIndex, { ...item, qtyDelivered: parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="w-full text-center bg-transparent text-sm text-gray-900 placeholder-gray-400"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span
                      className={`
                        inline-flex items-center justify-center
                        w-8 h-8 rounded-full text-white font-medium
                        ${difference === 0 ? 'bg-gray-400' : 'bg-blue-500'}
                      `}
                    >
                      {difference}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.unitPrice || ''}
                      onChange={(e) =>
                        onUpdateItem?.(originalIndex, { ...item, unitPrice: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0.00"
                      className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{totalPrice}</td>
                </tr>
              );
            })}
            {/* Editable empty rows */}
            {!searchQuery && emptyRows.map((emptyRow, i) => {
              const difference = calculateDifference(emptyRow.qtyPurchased, emptyRow.qtyDelivered);
              const totalPrice = calculateTotalPrice(emptyRow.unitPrice, emptyRow.qtyDelivered);

              return (
                <tr key={`empty-${i}`} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={emptyRow.barcode}
                      onChange={(e) => handleEmptyRowChange(i, 'barcode', e.target.value)}
                      placeholder="Enter barcode"
                      className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={emptyRow.productName}
                      onChange={(e) => handleEmptyRowChange(i, 'productName', e.target.value)}
                      placeholder="Enter product name"
                      className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={emptyRow.qtyPurchased || ''}
                      onChange={(e) => handleEmptyRowChange(i, 'qtyPurchased', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full text-center bg-transparent text-sm text-gray-900 placeholder-gray-400"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={emptyRow.qtyDelivered || ''}
                      onChange={(e) => handleEmptyRowChange(i, 'qtyDelivered', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full text-center bg-transparent text-sm text-gray-900 placeholder-gray-400"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-medium bg-gray-400">
                      {difference}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={emptyRow.unitPrice || ''}
                      onChange={(e) => handleEmptyRowChange(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{totalPrice}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
