from django.urls import path
from .views import (
    SalesSummaryView,
    DailySalesView,
    HourlySalesView,
    TopProductsView,
    SalesByStoreView,
    SalesByEmployeeView,
    SalesByPaymentMethodView,
    InventoryValueView,
    InventoryDetailView,
    LowStockReportView,
    StockMovementReportView,
    DashboardView,
)

app_name = 'reports'

urlpatterns = [
    # Dashboard
    path('dashboard/', DashboardView.as_view(), name='dashboard'),

    # Sales Reports
    path('sales/summary/', SalesSummaryView.as_view(), name='sales_summary'),
    path('sales/daily/', DailySalesView.as_view(), name='daily_sales'),
    path('sales/hourly/', HourlySalesView.as_view(), name='hourly_sales'),
    path('sales/by-store/', SalesByStoreView.as_view(), name='sales_by_store'),
    path('sales/by-employee/', SalesByEmployeeView.as_view(), name='sales_by_employee'),
    path('sales/by-payment-method/', SalesByPaymentMethodView.as_view(), name='sales_by_payment_method'),

    # Product Reports
    path('products/top-selling/', TopProductsView.as_view(), name='top_products'),

    # Inventory Reports
    path('inventory/value/', InventoryValueView.as_view(), name='inventory_value'),
    path('inventory/detail/', InventoryDetailView.as_view(), name='inventory_detail'),
    path('inventory/low-stock/', LowStockReportView.as_view(), name='low_stock'),
    path('inventory/movements/', StockMovementReportView.as_view(), name='stock_movements'),
]
