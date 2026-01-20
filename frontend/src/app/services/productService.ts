import api from '../lib/api';

// Backend response types
export interface SKU {
  id: number;
  product: number;
  product_name: string;
  sku_code: string;
  barcode: string;
  base_price: string; // Decimal comes as string from Django
}

export interface Product {
  id: number;
  name: string;
  description: string;
  created_at: string;
  sku_count: number;
}

export interface ProductDetail extends Product {
  skus: SKU[];
}

export interface CreateProductData {
  name: string;
  description?: string;
  skus?: {
    sku_code: string;
    barcode: string;
    base_price: number;
  }[];
}

export interface CreateSKUData {
  product: number;
  sku_code: string;
  barcode: string;
  base_price: number;
}

export const productService = {
  // Products
  async getProducts(search?: string): Promise<Product[]> {
    const params = search ? { search } : {};
    const response = await api.get<Product[]>('/products/', { params });
    return response.data;
  },

  async getProduct(id: number): Promise<ProductDetail> {
    const response = await api.get<ProductDetail>(`/products/${id}/`);
    return response.data;
  },

  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await api.post<Product>('/products/', data);
    return response.data;
  },

  async updateProduct(id: number, data: Partial<CreateProductData>): Promise<Product> {
    const response = await api.patch<Product>(`/products/${id}/`, data);
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/products/${id}/`);
  },

  // SKUs
  async getSKUs(search?: string, productId?: number): Promise<SKU[]> {
    const params: Record<string, string | number> = {};
    if (search) params.search = search;
    if (productId) params.product = productId;

    const response = await api.get<SKU[]>('/skus/', { params });
    return response.data;
  },

  async getSKU(id: number): Promise<SKU> {
    const response = await api.get<SKU>(`/skus/${id}/`);
    return response.data;
  },

  async getSKUByBarcode(barcode: string): Promise<SKU | null> {
    const response = await api.get<SKU[]>('/skus/', { params: { search: barcode } });
    const sku = response.data.find(s => s.barcode === barcode);
    return sku || null;
  },

  async createSKU(data: CreateSKUData): Promise<SKU> {
    const response = await api.post<SKU>('/skus/', data);
    return response.data;
  },

  async updateSKU(id: number, data: Partial<CreateSKUData>): Promise<SKU> {
    const response = await api.patch<SKU>(`/skus/${id}/`, data);
    return response.data;
  },

  async deleteSKU(id: number): Promise<void> {
    await api.delete(`/skus/${id}/`);
  },
};

export default productService;
