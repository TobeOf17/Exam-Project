from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Q

from .models import Store, Register, StockLevel, StockMovement
from .serializers import (
    StoreSerializer,
    RegisterSerializer,
    StockLevelSerializer,
    StockMovementSerializer,
    StockAdjustmentSerializer
)


class StoreViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing stores.
    """
    queryset = Store.objects.all().prefetch_related('registers')
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def registers(self, request, pk=None):
        """Get all registers for a store."""
        store = self.get_object()
        registers = store.registers.all()
        serializer = RegisterSerializer(registers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def inventory(self, request, pk=None):
        """Get inventory levels for a store."""
        store = self.get_object()
        stock_levels = StockLevel.objects.filter(store=store).select_related(
            'sku', 'sku__product'
        )
        serializer = StockLevelSerializer(stock_levels, many=True)
        return Response(serializer.data)


class RegisterViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing registers.
    """
    queryset = Register.objects.all().select_related('store')
    serializer_class = RegisterSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['store']


class StockLevelViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing stock levels.
    """
    queryset = StockLevel.objects.all().select_related('store', 'sku', 'sku__product')
    serializer_class = StockLevelSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['store', 'sku']
    ordering_fields = ['quantity']
    
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def adjust(self, request):
        """
        Adjust stock level for a SKU at a store.
        
        Request body:
        {
            "store_id": 1,
            "sku_id": 1,
            "quantity_change": 10,  # positive to add, negative to reduce
            "reason": "Stock count adjustment"
        }
        """
        serializer = StockAdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        store_id = serializer.validated_data['store_id']
        sku_id = serializer.validated_data['sku_id']
        quantity_change = serializer.validated_data['quantity_change']
        
        # Get or create stock level
        stock_level, created = StockLevel.objects.get_or_create(
            store_id=store_id,
            sku_id=sku_id,
            defaults={'quantity': 0}
        )
        
        # Calculate new quantity
        new_quantity = stock_level.quantity + quantity_change
        
        if new_quantity < 0:
            return Response(
                {'error': 'Adjustment would result in negative stock'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update stock level
        stock_level.quantity = new_quantity
        stock_level.save()
        
        # Record stock movement
        StockMovement.objects.create(
            stock_level=stock_level,
            movement_type='ADJUSTMENT',
            quantity_changed=quantity_change
        )
        
        return Response(
            StockLevelSerializer(stock_level).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """
        Get items with low stock (quantity <= threshold).
        Query param: threshold (default: 10)
        """
        threshold = int(request.query_params.get('threshold', 10))
        
        low_stock_items = self.get_queryset().filter(
            quantity__lte=threshold
        ).order_by('quantity')
        
        serializer = self.get_serializer(low_stock_items, many=True)
        
        return Response({
            'threshold': threshold,
            'count': low_stock_items.count(),
            'items': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        """Get items that are out of stock (quantity = 0)."""
        out_of_stock_items = self.get_queryset().filter(quantity=0)
        
        serializer = self.get_serializer(out_of_stock_items, many=True)
        
        return Response({
            'count': out_of_stock_items.count(),
            'items': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def by_store_and_sku(self, request):
        """
        Get stock level for specific store and SKU.
        Query params: store_id, sku_id
        """
        store_id = request.query_params.get('store_id')
        sku_id = request.query_params.get('sku_id')
        
        if not store_id or not sku_id:
            return Response(
                {'error': 'Both store_id and sku_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            stock_level = StockLevel.objects.select_related(
                'store', 'sku', 'sku__product'
            ).get(store_id=store_id, sku_id=sku_id)
            
            serializer = self.get_serializer(stock_level)
            return Response(serializer.data)
        except StockLevel.DoesNotExist:
            return Response(
                {'error': 'Stock level not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing stock movements (read-only).
    Stock movements are created automatically by other operations.
    """
    queryset = StockMovement.objects.all().select_related(
        'stock_level', 'stock_level__store', 'stock_level__sku', 'stock_level__sku__product'
    )
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['movement_type', 'stock_level__store', 'stock_level__sku']
    ordering = ['-timestamp']
    
    @action(detail=False, methods=['get'])
    def by_sku(self, request):
        """
        Get movement history for a specific SKU.
        Query param: sku_id
        """
        sku_id = request.query_params.get('sku_id')
        
        if not sku_id:
            return Response(
                {'error': 'sku_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        movements = self.get_queryset().filter(stock_level__sku_id=sku_id)
        serializer = self.get_serializer(movements, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_store(self, request):
        """
        Get movement history for a specific store.
        Query param: store_id
        """
        store_id = request.query_params.get('store_id')
        
        if not store_id:
            return Response(
                {'error': 'store_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        movements = self.get_queryset().filter(stock_level__store_id=store_id)
        serializer = self.get_serializer(movements, many=True)
        
        return Response(serializer.data)