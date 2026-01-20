import api from '../lib/api';
import { SKU } from './productService';

// Backend response types
export interface SaleLine {
  id: number;
  sale: number;
  sku: number;
  sku_details: SKU;
  quantity: number;
  unit_price: string;
  line_total: number;
}

export interface Sale {
  id: number;
  store: number;
  store_name: string;
  register: number;
  register_identifier: string;
  cashier: number;
  cashier_name: string;
  total_amount: string;
  payment_method: string;
  created_at: string;
  lines: SaleLine[];
}

export interface CreateSaleLineData {
  sku: number;
  quantity: number;
  unit_price: number;
}

export interface CreateSaleData {
  store: number;
  register: number;
  cashier: number;
  total_amount: number;
  payment_method: 'CASH' | 'CARD' | 'MOBILE' | 'OTHER';
  lines: CreateSaleLineData[];
}

export interface Receipt {
  id: number;
  sale: Sale;
  receipt_number: string;
}

export interface Return {
  id: number;
  original_sale: Sale;
  reason: string;
  created_at: string;
}

export interface Refund {
  id: number;
  return_record: Return;
  amount: string;
}

export interface CreateReturnData {
  original_sale_id: number;
  reason: string;
  line_items: {
    sku_id: number;
    quantity: number;
  }[];
}

export interface TodaySalesResponse {
  sales: Sale[];
  count: number;
  total_amount: number;
}

export interface SalesSummaryResponse {
  start_date: string;
  end_date: string;
  total_sales: number;
  total_revenue: number;
  average_sale: number;
}

export const salesService = {
  // Sales
  async getSales(filters?: {
    start_date?: string;
    end_date?: string;
    cashier?: number;
    store?: number;
  }): Promise<Sale[]> {
    const response = await api.get<Sale[]>('/sales/', { params: filters });
    return response.data;
  },

  async getSale(id: number): Promise<Sale> {
    const response = await api.get<Sale>(`/sales/${id}/`);
    return response.data;
  },

  async createSale(data: CreateSaleData): Promise<Sale> {
    const response = await api.post<Sale>('/sales/', data);
    return response.data;
  },

  async getTodaySales(): Promise<TodaySalesResponse> {
    const response = await api.get<TodaySalesResponse>('/sales/today/');
    return response.data;
  },

  async getSalesSummary(startDate?: string, endDate?: string): Promise<SalesSummaryResponse> {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await api.get<SalesSummaryResponse>('/sales/summary/', { params });
    return response.data;
  },

  async getReceipt(saleId: number): Promise<Receipt> {
    const response = await api.get<Receipt>(`/sales/${saleId}/receipt/`);
    return response.data;
  },

  // Returns
  async getReturns(): Promise<Return[]> {
    const response = await api.get<Return[]>('/returns/');
    return response.data;
  },

  async getReturn(id: number): Promise<Return> {
    const response = await api.get<Return>(`/returns/${id}/`);
    return response.data;
  },

  async createReturn(data: CreateReturnData): Promise<Return> {
    const response = await api.post<Return>('/returns/', data);
    return response.data;
  },

  async getRefund(returnId: number): Promise<Refund> {
    const response = await api.get<Refund>(`/returns/${returnId}/refund/`);
    return response.data;
  },
};

export default salesService;
