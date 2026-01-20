// Export all services
export { default as authService } from './authService';
export { default as productService } from './productService';
export { default as inventoryService } from './inventoryService';
export { default as salesService } from './salesService';
export { default as supplierService } from './supplierService';

// Export types
export type { LoginResponse, LoginCredentials } from './authService';
export type { SKU, Product, ProductDetail, CreateProductData, CreateSKUData } from './productService';
export type { Store, Register, StockLevel, StockMovement, StockAdjustmentData, LowStockResponse } from './inventoryService';
export type { Sale, SaleLine, CreateSaleData, CreateSaleLineData, Receipt, Return, Refund, CreateReturnData, TodaySalesResponse, SalesSummaryResponse } from './salesService';
export type { Supplier, PurchaseOrder, PurchaseOrderLine, CreateSupplierData, CreatePurchaseOrderData, CreatePurchaseOrderLineData } from './supplierService';
