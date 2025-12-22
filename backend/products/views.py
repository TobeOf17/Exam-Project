from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Product, SKU
from .serializers import ProductSerializer, SKUSerializer, ProductDetailSerializer


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing products.
    
    list: Get all products
    create: Create a new product
    retrieve: Get product details with SKUs
    update: Update a product
    partial_update: Partially update a product
    destroy: Delete a product
    """
    queryset = Product.objects.all().prefetch_related('skus')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'skus__sku_code', 'skus__barcode']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer
    
    @action(detail=True, methods=['get'])
    def skus(self, request, pk=None):
        """Get all SKUs for a product."""
        product = self.get_object()
        skus = product.skus.all()
        serializer = SKUSerializer(skus, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search products by name, SKU code, or barcode.
        Query param: q
        """
        query = request.query_params.get('q', '')
        
        if not query:
            return Response(
                {'error': 'Search query parameter "q" is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        products = Product.objects.filter(
            name__icontains=query
        ) | Product.objects.filter(
            skus__sku_code__icontains=query
        ) | Product.objects.filter(
            skus__barcode__icontains=query
        )
        
        products = products.distinct()
        serializer = self.get_serializer(products, many=True)
        
        return Response(serializer.data)


class SKUViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing SKUs.
    """
    queryset = SKU.objects.all().select_related('product')
    serializer_class = SKUSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['product']
    search_fields = ['sku_code', 'barcode', 'product__name']
    
    @action(detail=False, methods=['get'])
    def by_barcode(self, request):
        """
        Get SKU by barcode.
        Query param: barcode
        """
        barcode = request.query_params.get('barcode')
        
        if not barcode:
            return Response(
                {'error': 'Barcode parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            sku = SKU.objects.select_related('product').get(barcode=barcode)
            serializer = self.get_serializer(sku)
            return Response(serializer.data)
        except SKU.DoesNotExist:
            return Response(
                {'error': 'SKU not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def by_sku_code(self, request):
        """
        Get SKU by SKU code.
        Query param: code
        """
        code = request.query_params.get('code')
        
        if not code:
            return Response(
                {'error': 'SKU code parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            sku = SKU.objects.select_related('product').get(sku_code=code)
            serializer = self.get_serializer(sku)
            return Response(serializer.data)
        except SKU.DoesNotExist:
            return Response(
                {'error': 'SKU not found'},
                status=status.HTTP_404_NOT_FOUND
            )