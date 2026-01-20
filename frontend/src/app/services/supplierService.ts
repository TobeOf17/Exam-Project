import api from '../lib/api';
import { SKU } from './productService';

// Backend response types
export interface Supplier {
  id: number;
  name: string;
  contact_info: string;
}

export interface PurchaseOrderLine {
  id: number;
  purchase_order: number;
  sku: number;
  sku_details: SKU;
  quantity: number;
}

export interface PurchaseOrder {
  id: number;
  supplier: number;
  supplier_name: string;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  created_at: string;
  lines: PurchaseOrderLine[];
  total_items: number;
}

export interface CreateSupplierData {
  name: string;
  contact_info: string;
}

export interface CreatePurchaseOrderLineData {
  sku: number;
  quantity: number;
}

export interface CreatePurchaseOrderData {
  supplier: number;
  status?: string;
  lines: CreatePurchaseOrderLineData[];
}

export const supplierService = {
  // Suppliers
  async getSuppliers(search?: string): Promise<Supplier[]> {
    const params = search ? { search } : {};
    const response = await api.get<Supplier[]>('/suppliers/', { params });
    return response.data;
  },

  async getSupplier(id: number): Promise<Supplier> {
    const response = await api.get<Supplier>(`/suppliers/${id}/`);
    return response.data;
  },

  async createSupplier(data: CreateSupplierData): Promise<Supplier> {
    const response = await api.post<Supplier>('/suppliers/', data);
    return response.data;
  },

  async updateSupplier(id: number, data: Partial<CreateSupplierData>): Promise<Supplier> {
    const response = await api.patch<Supplier>(`/suppliers/${id}/`, data);
    return response.data;
  },

  async deleteSupplier(id: number): Promise<void> {
    await api.delete(`/suppliers/${id}/`);
  },

  // Purchase Orders
  async getPurchaseOrders(filters?: {
    supplier?: number;
    status?: string;
  }): Promise<PurchaseOrder[]> {
    const response = await api.get<PurchaseOrder[]>('/purchase-orders/', { params: filters });
    return response.data;
  },

  async getPurchaseOrder(id: number): Promise<PurchaseOrder> {
    const response = await api.get<PurchaseOrder>(`/purchase-orders/${id}/`);
    return response.data;
  },

  async createPurchaseOrder(data: CreatePurchaseOrderData): Promise<PurchaseOrder> {
    const response = await api.post<PurchaseOrder>('/purchase-orders/', data);
    return response.data;
  },

  async getPendingPurchaseOrders(): Promise<PurchaseOrder[]> {
    const response = await api.get<PurchaseOrder[]>('/purchase-orders/pending/');
    return response.data;
  },

  async receivePurchaseOrder(id: number, storeId: number): Promise<PurchaseOrder> {
    const response = await api.post<PurchaseOrder>(`/purchase-orders/${id}/receive/`, {
      store_id: storeId,
    });
    return response.data;
  },

  async cancelPurchaseOrder(id: number): Promise<PurchaseOrder> {
    const response = await api.post<PurchaseOrder>(`/purchase-orders/${id}/cancel/`);
    return response.data;
  },

  // Purchase Order Lines
  async getPurchaseOrderLines(purchaseOrderId?: number): Promise<PurchaseOrderLine[]> {
    const params = purchaseOrderId ? { purchase_order: purchaseOrderId } : {};
    const response = await api.get<PurchaseOrderLine[]>('/purchase-order-lines/', { params });
    return response.data;
  },
};

export default supplierService;
