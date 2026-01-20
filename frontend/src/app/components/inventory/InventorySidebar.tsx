'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, Package, FileText, PackageOpen } from 'lucide-react';

const menuItems = [
  {
    label: 'Create P/S',
    icon: ClipboardList,
    href: '/inventory/create-ps',
  },
  {
    label: 'Inventory list',
    icon: Package,
    href: '/inventory',
  },
  {
    label: 'Create PO',
    icon: FileText,
    href: '/inventory/create-po',
  },
  {
    label: 'Receive Stock',
    icon: PackageOpen,
    href: '/inventory/receive-stock',
  },
];

export default function InventorySidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 bg-[#3d5a6c] min-h-screen flex flex-col py-6">
      <nav className="flex flex-col gap-2 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-[#6b92ab] text-white shadow-md'
                    : 'text-gray-300 hover:bg-[#4a6575] hover:text-white'
                }
              `}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
