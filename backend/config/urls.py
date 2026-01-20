"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from products.views import ProductViewSet, SKUViewSet
from inventory.views import StoreViewSet, RegisterViewSet, StockLevelViewSet, StockMovementViewSet
from sales.views import SaleViewSet, ReturnViewSet
from suppliers.views import SupplierViewSet, PurchaseOrderViewSet, PurchaseOrderLineViewSet

# Create a router and register ViewSets
router = DefaultRouter()

# Products
router.register(r'products', ProductViewSet, basename='product')
router.register(r'skus', SKUViewSet, basename='sku')

# Inventory
router.register(r'stores', StoreViewSet, basename='store')
router.register(r'registers', RegisterViewSet, basename='register')
router.register(r'stock-levels', StockLevelViewSet, basename='stocklevel')
router.register(r'stock-movements', StockMovementViewSet, basename='stockmovement')

# Sales
router.register(r'sales', SaleViewSet, basename='sale')
router.register(r'returns', ReturnViewSet, basename='return')

# Suppliers
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchaseorder')
router.register(r'purchase-order-lines', PurchaseOrderLineViewSet, basename='purchaseorderline')

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/", include("accounts.urls")),
    path("api/reports/", include("reports.urls")),
]
