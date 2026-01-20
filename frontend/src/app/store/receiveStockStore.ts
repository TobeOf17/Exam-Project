import { create } from 'zustand';
import inventoryService from '../services/inventoryService';

export interface ReceivedStockItem {
  barcode: string;
  productName: string;
  qtyPurchased: number;
  qtyDelivered: number;
  unitPrice: number;
  skuId: number;
}

export interface ReceivedStock {
  id: string;
  linkedPoId?: string; // The Purchase Order ID this stock is linked to
  items: ReceivedStockItem[];
  totalAmount: number;
  storeId: number;
  createdAt: Date;
}

interface ReceiveStockState {
  receivedStocks: ReceivedStock[];
  isLoading: boolean;
  error: string | null;
}

interface ReceiveStockActions {
  addReceivedStock: (stock: Omit<ReceivedStock, 'id' | 'createdAt'>) => Promise<ReceivedStock>;
  getReceivedStockById: (id: string) => ReceivedStock | undefined;
  clearError: () => void;
}

type ReceiveStockStore = ReceiveStockState & ReceiveStockActions;

export const useReceiveStockStore = create<ReceiveStockStore>((set, get) => ({
  receivedStocks: [],
  isLoading: false,
  error: null,

  addReceivedStock: async (stockData) => {
    set({ isLoading: true, error: null });
    try {
      // For each item, adjust stock in the inventory
      for (const item of stockData.items) {
        if (item.qtyDelivered > 0) {
          await inventoryService.adjustStock({
            store_id: stockData.storeId,
            sku_id: item.skuId,
            quantity_change: item.qtyDelivered,
            reason: stockData.linkedPoId
              ? `Received from PO ${stockData.linkedPoId}`
              : 'Stock received',
          });
        }
      }

      const receivedStock: ReceivedStock = {
        ...stockData,
        id: `RS-${Date.now()}`,
        createdAt: new Date(),
      };

      set((state) => ({
        receivedStocks: [receivedStock, ...state.receivedStocks],
        isLoading: false,
      }));

      return receivedStock;
    } catch (error) {
      console.error('Error receiving stock:', error);
      set({ error: 'Failed to receive stock', isLoading: false });
      throw error;
    }
  },

  getReceivedStockById: (id) =>
    get().receivedStocks.find((stock) => stock.id === id),

  clearError: () => set({ error: null }),
}));
