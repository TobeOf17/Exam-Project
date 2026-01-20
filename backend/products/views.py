from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Product, SKU
from .serializers import ProductSerializer, SKUSerializer
from accounts.permissions import IsManagerOrReadOnly


class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for products.

    Permissions:
    - Managers: Can create, update, delete products
    - Cashiers: Can only view products
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsManagerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']


class SKUViewSet(viewsets.ModelViewSet):
    """
    API endpoint for SKUs.
    """
    queryset = SKU.objects.all().select_related('product')
    serializer_class = SKUSerializer
    permission_classes = [IsManagerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['product']
    search_fields = ['sku_code', 'barcode', 'product__name']