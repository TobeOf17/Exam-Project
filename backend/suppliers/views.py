from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction

from .models import Supplier, PurchaseOrder, PurchaseOrderLine
from .serializers import (
    SupplierSerializer,
    PurchaseOrderSerializer,
    PurchaseOrderCreateSerializer,
    PurchaseOrderLineSerializer
)
from inventory.models import StockLevel, StockMovement
from accounts.permissions import IsManagerOrReadOnly


class SupplierViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing suppliers.

    Permissions:
    - Managers: Full CRUD access
    - Cashiers: Read-only access
    """
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsManagerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'contact_info']
    ordering_fields = ['name']
    ordering = ['name']


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing purchase orders.

    Supports creating purchase orders with line items,
    and receiving orders to update inventory.
    """
    queryset = PurchaseOrder.objects.all().select_related('supplier').prefetch_related('lines', 'lines__sku')
    permission_classes = [IsManagerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['supplier', 'status']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return PurchaseOrderCreateSerializer
        return PurchaseOrderSerializer

    def create(self, request, *args, **kwargs):
        """Override create to return full serialized response with sku_details."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        # Re-fetch with proper select_related to ensure sku_details is populated
        instance = PurchaseOrder.objects.select_related('supplier').prefetch_related(
            'lines', 'lines__sku', 'lines__sku__product'
        ).get(pk=instance.pk)

        # Use the read serializer to include sku_details
        response_serializer = PurchaseOrderSerializer(instance)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def receive(self, request, pk=None):
        """
        Receive a purchase order and update inventory.

        Request body:
        {
            "store_id": 1  # Store to receive inventory into
        }
        """
        purchase_order = self.get_object()

        if purchase_order.status == 'RECEIVED':
            return Response(
                {'error': 'Purchase order has already been received'},
                status=status.HTTP_400_BAD_REQUEST
            )

        store_id = request.data.get('store_id')
        if not store_id:
            return Response(
                {'error': 'store_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update inventory for each line item
        for line in purchase_order.lines.all():
            stock_level, created = StockLevel.objects.get_or_create(
                store_id=store_id,
                sku=line.sku,
                defaults={'quantity': 0}
            )

            stock_level.quantity += line.quantity
            stock_level.save()

            # Record stock movement
            StockMovement.objects.create(
                stock_level=stock_level,
                movement_type='PURCHASE',
                quantity_changed=line.quantity
            )

        # Update purchase order status
        purchase_order.status = 'RECEIVED'
        purchase_order.save()

        return Response(
            PurchaseOrderSerializer(purchase_order).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a purchase order."""
        purchase_order = self.get_object()

        if purchase_order.status == 'RECEIVED':
            return Response(
                {'error': 'Cannot cancel a received purchase order'},
                status=status.HTTP_400_BAD_REQUEST
            )

        purchase_order.status = 'CANCELLED'
        purchase_order.save()

        return Response(
            PurchaseOrderSerializer(purchase_order).data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending purchase orders."""
        pending_orders = self.get_queryset().filter(status='PENDING')
        serializer = self.get_serializer(pending_orders, many=True)
        return Response(serializer.data)


class PurchaseOrderLineViewSet(viewsets.ModelViewSet):
    """ViewSet for managing purchase order lines."""
    queryset = PurchaseOrderLine.objects.all().select_related('purchase_order', 'sku', 'sku__product')
    serializer_class = PurchaseOrderLineSerializer
    permission_classes = [IsManagerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['purchase_order']
