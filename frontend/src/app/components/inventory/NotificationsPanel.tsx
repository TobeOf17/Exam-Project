'use client';

import { Bell, X } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'low_stock' | 'refund';
  message: string;
  productCode?: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onDismiss?: (id: string) => void;
}

export default function NotificationsPanel({
  notifications,
  onDismiss,
}: NotificationsPanelProps) {
  return (
    <div className="bg-[#c8e6d4] rounded-lg p-6 min-w-[320px] max-w-[320px]">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[#2d4a5c] font-semibold text-xl">Notifications</h3>
        <div className="ml-auto bg-[#2d4a5c] p-2 rounded-full">
          <Bell size={20} className="text-white" />
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-600">No notifications</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-[#d9f0e0] rounded-lg p-4 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  <div className="w-6 h-6 rounded-full border-2 border-[#2d4a5c] flex items-center justify-center">
                    <span className="text-[#2d4a5c] text-xs font-bold">i</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#2d4a5c] font-medium">
                    {notification.message}
                  </p>
                  {notification.productCode && (
                    <p className="text-xs text-orange-600 font-semibold mt-1">
                      {notification.productCode}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDismiss?.(notification.id)}
                className="text-[#2d4a5c] hover:text-red-600 flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
