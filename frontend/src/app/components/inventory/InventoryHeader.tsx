'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, ShoppingCart, Check, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/app/store/authStore';

export interface DropdownOption {
  value: string;
  label: string;
}

interface InventoryHeaderProps {
  searchPlaceholder?: string;
  userName?: string;
  onSearch?: (query: string) => void;
  // Dropdown mode props
  dropdownMode?: boolean;
  dropdownOptions?: DropdownOption[];
  selectedOption?: string;
  onOptionChange?: (value: string) => void;
}

export default function InventoryHeader({
  searchPlaceholder = 'Search Purchase Order',
  userName,
  onSearch,
  dropdownMode = false,
  dropdownOptions = [],
  selectedOption = '',
  onOptionChange,
}: InventoryHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Use userName prop if provided, otherwise use auth store user name
  const displayName = userName || user?.name || 'User';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const selectedLabel = dropdownOptions.find((opt) => opt.value === selectedOption)?.label || searchPlaceholder;

  return (
    <header className="bg-[#34516A] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ShoppingCart size={28} className="text-white" />
        <h1 className="text-white text-2xl font-semibold">Checkout</h1>
      </div>

      <div className="flex items-center gap-4">
        {dropdownMode ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between pl-4 pr-3 py-2 rounded-md w-96 text-sm border-none bg-[#4a6575] text-white"
            >
              <span>{selectedLabel}</span>
              <ChevronDown size={20} className={`text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#4a6575] rounded-md shadow-lg z-50 overflow-hidden">
                {dropdownOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onOptionChange?.(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-white hover:bg-[#5a7585] transition-colors"
                  >
                    <span>{option.label}</span>
                    {selectedOption === option.value && (
                      <Check size={18} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <button className="absolute right-12 top-1/2 -translate-y-1/2 bg-white rounded-full p-1.5">
              <Search size={18} className="text-[#34516A]" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch?.(e.target.value)}
              className="pl-4 pr-10 py-2 rounded-full w-96 text-sm border-none bg-[#4a6575] text-white placeholder-gray-300"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-1.5">
              <Search size={18} className="text-[#34516A]" />
            </button>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 bg-[#4a6575] px-4 py-2 rounded-full hover:bg-[#5a7585] transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold text-sm">
              {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <span className="text-white text-sm font-medium">{displayName}</span>
            <ChevronDown size={16} className={`text-white transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
