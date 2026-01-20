'use client';

import { Package } from 'lucide-react';

export interface Supplier {
  id: string;
  name: string;
  contact: string;
}

interface SupplierSelectorProps {
  suppliers: Supplier[];
  selectedSupplierId?: string;
  onSelectSupplier?: (supplierId: string) => void;
}

export default function SupplierSelector({
  suppliers,
  selectedSupplierId,
  onSelectSupplier,
}: SupplierSelectorProps) {
  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  return (
    <div className="bg-[#b8d4e8] rounded-lg p-4 min-w-[280px]">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[#2d4a5c] font-semibold text-lg">Select Supplier</h3>
        <Package size={20} className="text-[#2d4a5c]" />
      </div>

      <div className="space-y-3">
        {/* Dropdown */}
        <div>
          <label className="block text-[#2d4a5c] text-sm font-medium mb-2">
            Supplier
          </label>
          <select
            value={selectedSupplierId || ''}
            onChange={(e) => onSelectSupplier?.(e.target.value)}
            className="w-full px-3 py-2 rounded-md border-none bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4a6575]"
          >
            <option value="">Select a supplier...</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Supplier Details */}
        {selectedSupplier && (
          <div className="bg-white rounded-lg p-3 space-y-2">
            <div>
              <p className="text-xs text-gray-500">Supplier ID</p>
              <p className="text-sm font-medium text-[#2d4a5c]">{selectedSupplier.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Supplier Name</p>
              <p className="text-sm font-medium text-[#2d4a5c]">{selectedSupplier.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Contact</p>
              <p className="text-sm font-medium text-[#2d4a5c]">{selectedSupplier.contact}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
