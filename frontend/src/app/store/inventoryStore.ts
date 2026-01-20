import { create } from 'zustand';
import inventoryService, { StockLevel, Store, Register as APIRegister } from '../services/inventoryService';

export interface InventoryItem {
  id: number;
  barcode: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  purchasePrice: number;
  skuId: number;
  storeId: number;
  lastUpdated: Date;
}

export interface Register {
  id: number;
  name: string;
  storeId: number;
  storeName: string;
  isActive: boolean;
}

interface InventoryState {
  inventory: InventoryItem[];
  stores: Store[];
  registers: Register[];
  currentStoreId: number | null;
  isLoading: boolean;
  error: string | null;
}

interface InventoryActions {
  fetchInventory: (storeId?: number) => Promise<void>;
  fetchStores: () => Promise<void>;
  fetchRegisters: (storeId?: number) => Promise<void>;
  setCurrentStore: (storeId: number) => void;
  addOrUpdateInventory: (item: Omit<InventoryItem, 'lastUpdated' | 'id'>) => void;
  getInventoryByBarcode: (barcode: string) => InventoryItem | undefined;
  searchInventory: (query: string) => InventoryItem[];
  reduceQuantity: (barcode: string, qty: number) => Promise<void>;
  adjustStock: (skuId: number, storeId: number, quantityChange: number) => Promise<void>;
  clearError: () => void;
}

type InventoryStore = InventoryState & InventoryActions;

// Helper to map StockLevel from backend to frontend InventoryItem format
const mapStockLevelToInventory = (stockLevel: StockLevel): InventoryItem => ({
  id: stockLevel.id,
  barcode: stockLevel.sku_details.barcode,
  productName: stockLevel.product_name,
  quantity: stockLevel.quantity,
  sellingPrice: parseFloat(stockLevel.sku_details.base_price),
  purchasePrice: parseFloat(stockLevel.sku_details.base_price),
  skuId: stockLevel.sku,
  storeId: stockLevel.store,
  lastUpdated: new Date(),
});

// Helper to map API register to frontend Register format
const mapAPIRegisterToRegister = (apiRegister: APIRegister): Register => ({
  id: apiRegister.id,
  name: apiRegister.identifier || `Register ${apiRegister.id}`,
  storeId: apiRegister.store,
  storeName: apiRegister.store_name,
  isActive: true, // Assume active by default
});

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  inventory: [],
  stores: [],
  registers: [],
  currentStoreId: null,
  isLoading: false,
  error: null,

  fetchInventory: async (storeId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const targetStoreId = storeId || get().currentStoreId;
      const stockLevels = await inventoryService.getStockLevels(targetStoreId || undefined);
      const inventory = stockLevels.map(mapStockLevelToInventory);
      set({ inventory, isLoading: false });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      set({ error: 'Failed to fetch inventory', isLoading: false });
    }
  },

  fetchStores: async () => {
    try {
      const stores = await inventoryService.getStores();
      set({ stores });
      // Set first store as current if none selected
      if (!get().currentStoreId && stores.length > 0) {
        set({ currentStoreId: stores[0].id });
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  },

  fetchRegisters: async (storeId?: number) => {
    try {
      const targetStoreId = storeId || get().currentStoreId;
      const apiRegisters = await inventoryService.getRegisters(targetStoreId || undefined);
      const registers = apiRegisters.map(mapAPIRegisterToRegister);
      set({ registers });
    } catch (error) {
      console.error('Error fetching registers:', error);
    }
  },

  setCurrentStore: (storeId) => {
    set({ currentStoreId: storeId });
    // Fetch inventory for the new store
    get().fetchInventory(storeId);
  },

  addOrUpdateInventory: (item) =>
    set((state) => {
      const existingIndex = state.inventory.findIndex(
        (inv) => inv.barcode === item.barcode && inv.storeId === item.storeId
      );

      if (existingIndex !== -1) {
        // Update existing inventory item - add to quantity
        const updated = [...state.inventory];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
          lastUpdated: new Date(),
        };
        return { inventory: updated };
      } else {
        // Add new inventory item
        return {
          inventory: [
            { ...item, id: Date.now(), lastUpdated: new Date() },
            ...state.inventory,
          ],
        };
      }
    }),

  getInventoryByBarcode: (barcode) =>
    get().inventory.find((inv) => inv.barcode === barcode),

  searchInventory: (query) => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return [];

    return get().inventory.filter(
      (inv) =>
        inv.quantity > 0 &&
        (inv.barcode.toLowerCase().includes(lowerQuery) ||
          inv.productName.toLowerCase().includes(lowerQuery))
    );
  },

  reduceQuantity: async (barcode, qty) => {
    const item = get().inventory.find((inv) => inv.barcode === barcode);
    if (!item) return;

    try {
      // Call API to adjust stock
      await inventoryService.adjustStock({
        store_id: item.storeId,
        sku_id: item.skuId,
        quantity_change: -qty,
        reason: 'Sale',
      });

      // Update local state
      set((state) => ({
        inventory: state.inventory.map((inv) => {
          if (inv.barcode === barcode) {
            return {
              ...inv,
              quantity: Math.max(0, inv.quantity - qty),
              lastUpdated: new Date(),
            };
          }
          return inv;
        }),
      }));
    } catch (error) {
      console.error('Error reducing quantity:', error);
      throw error;
    }
  },

  adjustStock: async (skuId, storeId, quantityChange) => {
    set({ isLoading: true, error: null });
    try {
      await inventoryService.adjustStock({
        store_id: storeId,
        sku_id: skuId,
        quantity_change: quantityChange,
      });
      // Refresh inventory
      await get().fetchInventory(storeId);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      set({ error: 'Failed to adjust stock', isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
