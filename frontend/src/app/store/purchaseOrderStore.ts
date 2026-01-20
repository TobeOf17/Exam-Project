import { create } from 'zustand';
import supplierService, { PurchaseOrder as APIPurchaseOrder } from '../services/supplierService';

export interface PurchaseOrderItem {
  barcode: string;
  productName: string;
  qtyNeeded: number;
  unitPrice: number;
  skuId: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  createdAt: Date;
  selected: boolean;
}

interface PurchaseOrderState {
  purchaseOrders: PurchaseOrder[];
  isLoading: boolean;
  error: string | null;
}

interface PurchaseOrderActions {
  fetchPurchaseOrders: (filters?: { supplier?: number; status?: string }) => Promise<void>;
  fetchPendingOrders: () => Promise<void>;
  addPurchaseOrder: (order: {
    supplierId: number;
    items: { skuId: number; quantity: number }[];
  }) => Promise<PurchaseOrder>;
  receivePurchaseOrder: (id: string, storeId: number) => Promise<void>;
  cancelPurchaseOrder: (id: string) => Promise<void>;
  togglePurchaseOrder: (id: string) => void;
  getSelectedOrders: () => PurchaseOrder[];
  clearError: () => void;
}

type PurchaseOrderStore = PurchaseOrderState & PurchaseOrderActions;

// Helper to map API PurchaseOrder to frontend PurchaseOrder format
const mapAPIPurchaseOrderToPurchaseOrder = (apiPO: APIPurchaseOrder): PurchaseOrder => {
  const items = apiPO.lines.map((line) => ({
    barcode: line.sku_details.barcode,
    productName: line.sku_details.product_name,
    qtyNeeded: line.quantity,
    unitPrice: parseFloat(line.sku_details.base_price),
    skuId: line.sku,
  }));

  const totalAmount = items.reduce(
    (sum, item) => sum + item.qtyNeeded * item.unitPrice,
    0
  );

  return {
    id: String(apiPO.id),
    supplierId: String(apiPO.supplier),
    supplierName: apiPO.supplier_name,
    items,
    totalAmount,
    status: apiPO.status,
    createdAt: new Date(apiPO.created_at),
    selected: false,
  };
};

export const usePurchaseOrderStore = create<PurchaseOrderStore>((set, get) => ({
  purchaseOrders: [],
  isLoading: false,
  error: null,

  fetchPurchaseOrders: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const apiPOs = await supplierService.getPurchaseOrders(filters);
      const purchaseOrders = apiPOs.map(mapAPIPurchaseOrderToPurchaseOrder);
      set({ purchaseOrders, isLoading: false });
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      set({ error: 'Failed to fetch purchase orders', isLoading: false });
    }
  },

  fetchPendingOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiPOs = await supplierService.getPendingPurchaseOrders();
      const purchaseOrders = apiPOs.map(mapAPIPurchaseOrderToPurchaseOrder);
      set({ purchaseOrders, isLoading: false });
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      set({ error: 'Failed to fetch pending orders', isLoading: false });
    }
  },

  addPurchaseOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      const apiPO = await supplierService.createPurchaseOrder({
        supplier: orderData.supplierId,
        lines: orderData.items.map((item) => ({
          sku: item.skuId,
          quantity: item.quantity,
        })),
      });

      const purchaseOrder = mapAPIPurchaseOrderToPurchaseOrder(apiPO);

      set((state) => ({
        purchaseOrders: [purchaseOrder, ...state.purchaseOrders],
        isLoading: false,
      }));

      return purchaseOrder;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      set({ error: 'Failed to create purchase order', isLoading: false });
      throw error;
    }
  },

  receivePurchaseOrder: async (id, storeId) => {
    set({ isLoading: true, error: null });
    try {
      const apiPO = await supplierService.receivePurchaseOrder(parseInt(id), storeId);
      const updatedPO = mapAPIPurchaseOrderToPurchaseOrder(apiPO);

      set((state) => ({
        purchaseOrders: state.purchaseOrders.map((po) =>
          po.id === id ? { ...updatedPO, selected: po.selected } : po
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error receiving purchase order:', error);
      set({ error: 'Failed to receive purchase order', isLoading: false });
      throw error;
    }
  },

  cancelPurchaseOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const apiPO = await supplierService.cancelPurchaseOrder(parseInt(id));
      const updatedPO = mapAPIPurchaseOrderToPurchaseOrder(apiPO);

      set((state) => ({
        purchaseOrders: state.purchaseOrders.map((po) =>
          po.id === id ? { ...updatedPO, selected: po.selected } : po
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error cancelling purchase order:', error);
      set({ error: 'Failed to cancel purchase order', isLoading: false });
      throw error;
    }
  },

  togglePurchaseOrder: (id) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id ? { ...po, selected: !po.selected } : po
      ),
    })),

  getSelectedOrders: () => get().purchaseOrders.filter((po) => po.selected),

  clearError: () => set({ error: null }),
}));
