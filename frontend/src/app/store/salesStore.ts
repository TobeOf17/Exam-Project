import { create } from 'zustand';
import salesService, { Sale as APISale, CreateSaleData } from '../services/salesService';

export interface SaleItem {
  barcode: string;
  name: string;
  quantity: number;
  price: number;
  skuId: number;
}

export interface Sale {
  id: number;
  orderId: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: {
    cash: number;
    card: number;
    transfer: number;
  };
  storeId: number;
  registerId: number;
  cashierId: number;
  createdAt: Date;
}

interface SalesState {
  sales: Sale[];
  isLoading: boolean;
  error: string | null;
}

interface SalesActions {
  fetchSales: () => Promise<void>;
  fetchTodaySales: () => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'orderId'>) => Promise<Sale>;
  getSaleByOrderId: (orderId: string) => Sale | undefined;
  generateOrderId: () => string;
  clearError: () => void;
}

type SalesStore = SalesState & SalesActions;

// Helper to map API Sale to frontend Sale format
const mapAPISaleToSale = (apiSale: APISale): Sale => {
  // Parse payment method - backend stores as single string, we need to convert
  const paymentMethod = {
    cash: 0,
    card: 0,
    transfer: 0,
  };

  const method = apiSale.payment_method.toLowerCase();
  const amount = parseFloat(apiSale.total_amount);

  if (method === 'cash') paymentMethod.cash = amount;
  else if (method === 'card') paymentMethod.card = amount;
  else if (method === 'mobile' || method === 'transfer') paymentMethod.transfer = amount;

  return {
    id: apiSale.id,
    orderId: `ORD-${apiSale.id}`,
    items: apiSale.lines.map((line) => ({
      barcode: line.sku_details.barcode,
      name: line.sku_details.product_name,
      quantity: line.quantity,
      price: parseFloat(line.unit_price),
      skuId: line.sku,
    })),
    totalAmount: parseFloat(apiSale.total_amount),
    paymentMethod,
    storeId: apiSale.store,
    registerId: apiSale.register,
    cashierId: apiSale.cashier,
    createdAt: new Date(apiSale.created_at),
  };
};

export const useSalesStore = create<SalesStore>((set, get) => ({
  sales: [],
  isLoading: false,
  error: null,

  fetchSales: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiSales = await salesService.getSales();
      const sales = apiSales.map(mapAPISaleToSale);
      set({ sales, isLoading: false });
    } catch (error) {
      console.error('Error fetching sales:', error);
      set({ error: 'Failed to fetch sales', isLoading: false });
    }
  },

  fetchTodaySales: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await salesService.getTodaySales();
      const sales = response.sales.map(mapAPISaleToSale);
      set({ sales, isLoading: false });
    } catch (error) {
      console.error('Error fetching today sales:', error);
      set({ error: 'Failed to fetch today sales', isLoading: false });
    }
  },

  addSale: async (saleData) => {
    set({ isLoading: true, error: null });
    try {
      // Determine payment method for API
      let paymentMethod: 'CASH' | 'CARD' | 'MOBILE' | 'OTHER' = 'CASH';
      if (saleData.paymentMethod.card > 0) paymentMethod = 'CARD';
      else if (saleData.paymentMethod.transfer > 0) paymentMethod = 'MOBILE';

      const createData: CreateSaleData = {
        store: saleData.storeId,
        register: saleData.registerId,
        cashier: saleData.cashierId,
        total_amount: saleData.totalAmount,
        payment_method: paymentMethod,
        lines: saleData.items.map((item) => ({
          sku: item.skuId,
          quantity: item.quantity,
          unit_price: item.price,
        })),
      };

      const apiSale = await salesService.createSale(createData);
      const sale = mapAPISaleToSale(apiSale);

      set((state) => ({
        sales: [sale, ...state.sales],
        isLoading: false,
      }));

      return sale;
    } catch (error) {
      console.error('Error creating sale:', error);
      set({ error: 'Failed to create sale', isLoading: false });
      throw error;
    }
  },

  getSaleByOrderId: (orderId: string) => {
    return get().sales.find(
      (sale) => sale.orderId.toLowerCase() === orderId.toLowerCase()
    );
  },

  generateOrderId: () => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${datePart}-${randomPart}`;
  },

  clearError: () => set({ error: null }),
}));
