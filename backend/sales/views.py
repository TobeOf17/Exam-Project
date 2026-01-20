from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Sale, SaleLine, Receipt, Return, Refund
from .serializers import (
    SaleSerializer,
    SaleCreateSerializer,
    SaleLineSerializer,
    ReceiptSerializer,
    ReturnSerializer,
    RefundSerializer
)
from inventory.models import StockLevel, StockMovement


class SaleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing sales.
    
    list: Get all sales
    create: Create a new sale (processes transaction and updates inventory)
    retrieve: Get sale details
    """
    queryset = Sale.objects.all().select_related(
        'store', 'register', 'cashier'
    ).prefetch_related('lines', 'lines__sku', 'lines__sku__product')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SaleCreateSerializer
        return SaleSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Filter by cashier
        cashier_id = self.request.query_params.get('cashier')
        if cashier_id:
            queryset = queryset.filter(cashier_id=cashier_id)
        
        # Filter by store
        store_id = self.request.query_params.get('store')
        if store_id:
            queryset = queryset.filter(store_id=store_id)
        
        return queryset.order_by('-created_at')
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Create a new sale and update inventory.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create the sale
        sale = serializer.save()
        
        # Update inventory for each line item
        for line in sale.lines.all():
            try:
                stock_level = StockLevel.objects.get(
                    store=sale.store,
                    sku=line.sku
                )
                
                # Check if enough stock
                if stock_level.quantity < line.quantity:
                    raise ValueError(
                        f"Insufficient stock for {line.sku.product.name}. "
                        f"Available: {stock_level.quantity}, Required: {line.quantity}"
                    )
                
                # Reduce stock
                stock_level.quantity -= line.quantity
                stock_level.save()
                
                # Record stock movement
                StockMovement.objects.create(
                    stock_level=stock_level,
                    movement_type='SALE',
                    quantity_changed=-line.quantity
                )
                
            except StockLevel.DoesNotExist:
                raise ValueError(f"Stock not found for {line.sku.product.name} at {sale.store.name}")
        
        # Generate receipt
        receipt_number = f"RCP-{sale.id}-{timezone.now().strftime('%Y%m%d%H%M%S')}"
        Receipt.objects.create(
            sale=sale,
            receipt_number=receipt_number
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            SaleSerializer(sale).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(detail=True, methods=['get'])
    def receipt(self, request, pk=None):
        """Get receipt for a sale."""
        sale = self.get_object()
        try:
            receipt = sale.receipt
            serializer = ReceiptSerializer(receipt)
            return Response(serializer.data)
        except Receipt.DoesNotExist:
            return Response(
                {'error': 'Receipt not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's sales."""
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_sales = self.get_queryset().filter(created_at__gte=today_start)
        
        serializer = self.get_serializer(today_sales, many=True)
        
        # Calculate totals
        total_amount = sum(sale.total_amount for sale in today_sales)
        
        return Response({
            'sales': serializer.data,
            'count': today_sales.count(),
            'total_amount': total_amount
        })
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get sales summary for a date range."""
        # Default to last 30 days
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        # Override with query params if provided
        start_param = request.query_params.get('start_date')
        end_param = request.query_params.get('end_date')
        
        if start_param:
            start_date = datetime.fromisoformat(start_param)
        if end_param:
            end_date = datetime.fromisoformat(end_param)
        
        sales = self.get_queryset().filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        total_sales = sales.count()
        total_revenue = sum(sale.total_amount for sale in sales)
        
        return Response({
            'start_date': start_date,
            'end_date': end_date,
            'total_sales': total_sales,
            'total_revenue': total_revenue,
            'average_sale': total_revenue / total_sales if total_sales > 0 else 0
        })


class ReturnViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing returns and refunds.
    """
    queryset = Return.objects.all().select_related('original_sale')
    serializer_class = ReturnSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Process a return and update inventory.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        return_record = serializer.save()
        original_sale = return_record.original_sale
        
        # Get line items from request
        line_items = request.data.get('line_items', [])
        
        if not line_items:
            return Response(
                {'error': 'At least one line item must be specified for return'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        refund_amount = 0
        
        # Process each returned item
        for item in line_items:
            sku_id = item.get('sku_id')
            quantity = item.get('quantity')
            
            # Find the original sale line
            try:
                sale_line = SaleLine.objects.get(
                    sale=original_sale,
                    sku_id=sku_id
                )
            except SaleLine.DoesNotExist:
                return Response(
                    {'error': f'SKU {sku_id} not found in original sale'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if quantity > sale_line.quantity:
                return Response(
                    {'error': f'Return quantity exceeds original purchase quantity'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update inventory
            stock_level, created = StockLevel.objects.get_or_create(
                store=original_sale.store,
                sku_id=sku_id,
                defaults={'quantity': 0}
            )
            
            stock_level.quantity += quantity
            stock_level.save()
            
            # Record stock movement
            StockMovement.objects.create(
                stock_level=stock_level,
                movement_type='RETURN',
                quantity_changed=quantity
            )
            
            # Calculate refund
            refund_amount += sale_line.unit_price * quantity
        
        # Create refund record
        Refund.objects.create(
            return_record=return_record,
            amount=refund_amount
        )
        
        return Response(
            ReturnSerializer(return_record).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'])
    def refund(self, request, pk=None):
        """Get refund details for a return."""
        return_record = self.get_object()
        try:
            refund = return_record.refund
            serializer = RefundSerializer(refund)
            return Response(serializer.data)
        except Refund.DoesNotExist:
            return Response(
                {'error': 'Refund not found'},
                status=status.HTTP_404_NOT_FOUND
            )
