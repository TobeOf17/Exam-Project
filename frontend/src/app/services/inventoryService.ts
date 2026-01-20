import api from '../lib/api';
import { SKU } from './productService';

// Backend response types
export interface Register {
  id: number;
  store: number;
  store_name: string;
  identifier: string;
}

export interface Store {
  id: number;
  name: string;
  location: string;
  registers: Register[];
  register_count: number;
}

export interface StockLevel {
  id: number;
  store: number;
  store_name: string;
  sku: number;
  sku_details: SKU;
  product_name: string;
  quantity: number;
  is_low_stock: boolean;
}

export interface StockMovement {
  id: number;
  stock_level: number;
  store_name: string;
  product_name: string;
  sku_code: string;
  movement_type: 'SALE' | 'PURCHASE' | 'RETURN' | 'ADJUSTMENT';
  movement_type_display: string;
  quantity_changed: number;
  timestamp: string;
}

export interface StockAdjustmentData {
  store_id: number;
  sku_id: number;
  quantity_change: number;
  reason?: string;
}

export interface LowStockResponse {
  threshold: number;
  count: number;
  items: StockLevel[];
}

// Paginated response type
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const inventoryService = {
  // Stores
  async getStores(): Promise<Store[]> {
    const response = await api.get<PaginatedResponse<Store> | Store[]>('/stores/');
    // Handle both paginated and non-paginated responses
    if ('results' in response.data) {
      return response.data.results;
    }
    return response.data;
  },

  async getStore(id: number): Promise<Store> {
    const response = await api.get<Store>(`/stores/${id}/`);
    return response.data;
  },

  async createStore(data: { name: string; location: string }): Promise<Store> {
    const response = await api.post<Store>('/stores/', data);
    return response.data;
  },

  async getStoreInventory(storeId: number): Promise<StockLevel[]> {
    const response = await api.get<StockLevel[]>(`/stores/${storeId}/inventory/`);
    return response.data;
  },

  async getStoreRegisters(storeId: number): Promise<Register[]> {
    const response = await api.get<Register[]>(`/stores/${storeId}/registers/`);
    return response.data;
  },

  // Registers
  async getRegisters(storeId?: number): Promise<Register[]> {
    const params = storeId ? { store: storeId } : {};
    const response = await api.get<PaginatedResponse<Register> | Register[]>('/registers/', { params });
    // Handle both paginated and non-paginated responses
    if ('results' in response.data) {
      return response.data.results;
    }
    return response.data;
  },

  async createRegister(data: { store: number; identifier: string }): Promise<Register> {
    const response = await api.post<Register>('/registers/', data);
    return response.data;
  },

  // Stock Levels
  async getStockLevels(storeId?: number, skuId?: number): Promise<StockLevel[]> {
    const params: Record<string, number> = {};
    if (storeId) params.store = storeId;
    if (skuId) params.sku = skuId;

    const response = await api.get<PaginatedResponse<StockLevel> | StockLevel[]>('/stock-levels/', { params });
    // Handle both paginated and non-paginated responses
    if ('results' in response.data) {
      return response.data.results;
    }
    return response.data;
  },

  async getStockLevel(storeId: number, skuId: number): Promise<StockLevel | null> {
    try {
      const response = await api.get<StockLevel>('/stock-levels/by_store_and_sku/', {
        params: { store_id: storeId, sku_id: skuId },
      });
      return response.data;
    } catch {
      return null;
    }
  },

  async adjustStock(data: StockAdjustmentData): Promise<StockLevel> {
    const response = await api.post<StockLevel>('/stock-levels/adjust/', data);
    return response.data;
  },

  async getLowStock(threshold?: number): Promise<LowStockResponse> {
    const params = threshold ? { threshold } : {};
    const response = await api.get<LowStockResponse>('/stock-levels/low_stock/', { params });
    return response.data;
  },

  async getOutOfStock(): Promise<{ count: number; items: StockLevel[] }> {
    const response = await api.get<{ count: number; items: StockLevel[] }>(
      '/stock-levels/out_of_stock/'
    );
    return response.data;
  },

  // Stock Movements
  async getStockMovements(storeId?: number, skuId?: number): Promise<StockMovement[]> {
    let url = '/stock-movements/';
    const params: Record<string, number> = {};

    if (storeId) {
      url = '/stock-movements/by_store/';
      params.store_id = storeId;
    } else if (skuId) {
      url = '/stock-movements/by_sku/';
      params.sku_id = skuId;
    }

    const response = await api.get<StockMovement[]>(url, { params });
    return response.data;
  },
};

export default inventoryService;
