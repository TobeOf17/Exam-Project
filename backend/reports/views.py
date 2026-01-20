from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, F, DecimalField
from django.db.models.functions import TruncDate, TruncHour, Coalesce
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from sales.models import Sale, SaleLine
from products.models import Product, SKU
from inventory.models import Store, StockLevel, StockMovement
from accounts.models import Employee
from .serializers import (
    SalesSummarySerializer,
    DailySalesSerializer,
    TopProductSerializer,
    SalesByStoreSerializer,
    SalesByEmployeeSerializer,
    SalesByPaymentMethodSerializer,
    InventoryValueSerializer,
    InventoryItemSerializer,
    LowStockAlertSerializer,
    StockMovementReportSerializer,
    HourlySalesSerializer,
)


class SalesSummaryView(APIView):
    """
    Sales summary report.

    Query params:
    - period: 'today', 'week', 'month', 'year', 'custom'
    - start_date: Required if period is 'custom'
    - end_date: Required if period is 'custom'
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'today')
        now = timezone.now()

        # Determine date range based on period
        if period == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = now
        elif period == 'week':
            start_date = now - timedelta(days=7)
            end_date = now
        elif period == 'month':
            start_date = now - timedelta(days=30)
            end_date = now
        elif period == 'year':
            start_date = now - timedelta(days=365)
            end_date = now
        elif period == 'custom':
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            if not start_date or not end_date:
                return Response({'error': 'start_date and end_date required for custom period'}, status=400)
        else:
            return Response({'error': 'Invalid period'}, status=400)

        # Query sales
        sales = Sale.objects.filter(created_at__gte=start_date, created_at__lte=end_date)

        total_sales = sales.count()
        total_revenue = sales.aggregate(total=Coalesce(Sum('total_amount'), Decimal('0')))['total']

        # Get total items sold
        total_items = SaleLine.objects.filter(
            sale__in=sales
        ).aggregate(total=Coalesce(Sum('quantity'), 0))['total']

        average_sale = total_revenue / total_sales if total_sales > 0 else Decimal('0')

        data = {
            'period': period,
            'start_date': start_date,
            'end_date': end_date,
            'total_sales': total_sales,
            'total_revenue': total_revenue,
            'total_items_sold': total_items,
            'average_sale': average_sale,
        }

        serializer = SalesSummarySerializer(data)
        return Response(serializer.data)


class DailySalesView(APIView):
    """
    Daily sales breakdown for a date range.

    Query params:
    - days: Number of days to look back (default: 7)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 7))
        start_date = timezone.now() - timedelta(days=days)

        daily_sales = Sale.objects.filter(
            created_at__gte=start_date
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            total_sales=Count('id'),
            total_revenue=Sum('total_amount'),
        ).order_by('date')

        # Get items sold per day
        result = []
        for day in daily_sales:
            items = SaleLine.objects.filter(
                sale__created_at__date=day['date']
            ).aggregate(total=Coalesce(Sum('quantity'), 0))['total']

            result.append({
                'date': day['date'],
                'total_sales': day['total_sales'],
                'total_revenue': day['total_revenue'] or Decimal('0'),
                'total_items': items,
            })

        serializer = DailySalesSerializer(result, many=True)
        return Response(serializer.data)


class HourlySalesView(APIView):
    """
    Hourly sales breakdown for today.
    Useful for identifying peak hours.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)

        hourly_sales = Sale.objects.filter(
            created_at__gte=today_start
        ).annotate(
            hour=TruncHour('created_at')
        ).values('hour').annotate(
            total_sales=Count('id'),
            total_revenue=Sum('total_amount'),
        ).order_by('hour')

        result = []
        for entry in hourly_sales:
            result.append({
                'hour': entry['hour'].hour if entry['hour'] else 0,
                'total_sales': entry['total_sales'],
                'total_revenue': entry['total_revenue'] or Decimal('0'),
            })

        serializer = HourlySalesSerializer(result, many=True)
        return Response(serializer.data)


class TopProductsView(APIView):
    """
    Top selling products report.

    Query params:
    - days: Number of days to look back (default: 30)
    - limit: Number of products to return (default: 10)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        limit = int(request.query_params.get('limit', 10))
        start_date = timezone.now() - timedelta(days=days)

        top_products = SaleLine.objects.filter(
            sale__created_at__gte=start_date
        ).values(
            'sku__product__id',
            'sku__product__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('unit_price'), output_field=DecimalField()),
            transaction_count=Count('sale', distinct=True)
        ).order_by('-total_quantity')[:limit]

        result = []
        for product in top_products:
            result.append({
                'product_id': product['sku__product__id'],
                'product_name': product['sku__product__name'],
                'total_quantity': product['total_quantity'],
                'total_revenue': product['total_revenue'] or Decimal('0'),
                'transaction_count': product['transaction_count'],
            })

        serializer = TopProductSerializer(result, many=True)
        return Response(serializer.data)


class SalesByStoreView(APIView):
    """
    Sales breakdown by store.

    Query params:
    - days: Number of days to look back (default: 30)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)

        sales_by_store = Sale.objects.filter(
            created_at__gte=start_date
        ).values(
            'store__id',
            'store__name'
        ).annotate(
            total_sales=Count('id'),
            total_revenue=Sum('total_amount'),
            average_sale=Avg('total_amount')
        ).order_by('-total_revenue')

        result = []
        for store in sales_by_store:
            result.append({
                'store_id': store['store__id'],
                'store_name': store['store__name'],
                'total_sales': store['total_sales'],
                'total_revenue': store['total_revenue'] or Decimal('0'),
                'average_sale': store['average_sale'] or Decimal('0'),
            })

        serializer = SalesByStoreSerializer(result, many=True)
        return Response(serializer.data)


class SalesByEmployeeView(APIView):
    """
    Sales breakdown by employee/cashier.

    Query params:
    - days: Number of days to look back (default: 30)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)

        sales_by_employee = Sale.objects.filter(
            created_at__gte=start_date
        ).values(
            'cashier__id',
            'cashier__first_name',
            'cashier__last_name',
            'cashier__role'
        ).annotate(
            total_sales=Count('id'),
            total_revenue=Sum('total_amount'),
            average_sale=Avg('total_amount')
        ).order_by('-total_revenue')

        result = []
        for emp in sales_by_employee:
            result.append({
                'employee_id': emp['cashier__id'],
                'employee_name': f"{emp['cashier__first_name']} {emp['cashier__last_name']}",
                'role': emp['cashier__role'],
                'total_sales': emp['total_sales'],
                'total_revenue': emp['total_revenue'] or Decimal('0'),
                'average_sale': emp['average_sale'] or Decimal('0'),
            })

        serializer = SalesByEmployeeSerializer(result, many=True)
        return Response(serializer.data)


class SalesByPaymentMethodView(APIView):
    """
    Sales breakdown by payment method.

    Query params:
    - days: Number of days to look back (default: 30)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)

        sales = Sale.objects.filter(created_at__gte=start_date)
        total_revenue_all = sales.aggregate(total=Coalesce(Sum('total_amount'), Decimal('0')))['total']

        sales_by_method = sales.values('payment_method').annotate(
            total_sales=Count('id'),
            total_revenue=Sum('total_amount')
        ).order_by('-total_revenue')

        result = []
        for method in sales_by_method:
            revenue = method['total_revenue'] or Decimal('0')
            percentage = (revenue / total_revenue_all * 100) if total_revenue_all > 0 else Decimal('0')
            result.append({
                'payment_method': method['payment_method'],
                'total_sales': method['total_sales'],
                'total_revenue': revenue,
                'percentage': round(percentage, 2),
            })

        serializer = SalesByPaymentMethodSerializer(result, many=True)
        return Response(serializer.data)


class InventoryValueView(APIView):
    """
    Inventory valuation report by store.
    Shows total value of inventory based on base prices.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        store_id = request.query_params.get('store_id')

        queryset = StockLevel.objects.select_related('store', 'sku')

        if store_id:
            queryset = queryset.filter(store_id=store_id)

        # Group by store
        stores = Store.objects.all()
        if store_id:
            stores = stores.filter(id=store_id)

        result = []
        for store in stores:
            stock_levels = queryset.filter(store=store)

            total_items = stock_levels.aggregate(total=Coalesce(Sum('quantity'), 0))['total']
            total_skus = stock_levels.count()

            # Calculate total value
            total_value = Decimal('0')
            for sl in stock_levels:
                total_value += sl.quantity * sl.sku.base_price

            result.append({
                'store_id': store.id,
                'store_name': store.name,
                'total_items': total_items,
                'total_skus': total_skus,
                'total_value': total_value,
            })

        serializer = InventoryValueSerializer(result, many=True)
        return Response(serializer.data)


class InventoryDetailView(APIView):
    """
    Detailed inventory listing.

    Query params:
    - store_id: Filter by store
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        store_id = request.query_params.get('store_id')

        queryset = StockLevel.objects.select_related('store', 'sku', 'sku__product')

        if store_id:
            queryset = queryset.filter(store_id=store_id)

        result = []
        for sl in queryset.order_by('store__name', 'sku__product__name'):
            result.append({
                'sku_id': sl.sku.id,
                'sku_code': sl.sku.sku_code,
                'product_name': sl.sku.product.name,
                'store_name': sl.store.name,
                'quantity': sl.quantity,
                'unit_price': sl.sku.base_price,
                'total_value': sl.quantity * sl.sku.base_price,
            })

        serializer = InventoryItemSerializer(result, many=True)
        return Response(serializer.data)


class LowStockReportView(APIView):
    """
    Low stock alerts report.

    Query params:
    - threshold: Stock level threshold (default: 10)
    - critical_threshold: Critical level threshold (default: 5)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        threshold = int(request.query_params.get('threshold', 10))
        critical_threshold = int(request.query_params.get('critical_threshold', 5))

        low_stock = StockLevel.objects.filter(
            quantity__lte=threshold
        ).select_related('store', 'sku', 'sku__product').order_by('quantity')

        result = []
        for sl in low_stock:
            if sl.quantity == 0:
                status = 'OUT_OF_STOCK'
            elif sl.quantity <= critical_threshold:
                status = 'CRITICAL'
            else:
                status = 'LOW'

            result.append({
                'sku_id': sl.sku.id,
                'sku_code': sl.sku.sku_code,
                'product_name': sl.sku.product.name,
                'store_id': sl.store.id,
                'store_name': sl.store.name,
                'current_quantity': sl.quantity,
                'threshold': threshold,
                'status': status,
            })

        serializer = LowStockAlertSerializer(result, many=True)
        return Response({
            'threshold': threshold,
            'critical_threshold': critical_threshold,
            'total_alerts': len(result),
            'out_of_stock': len([r for r in result if r['status'] == 'OUT_OF_STOCK']),
            'critical': len([r for r in result if r['status'] == 'CRITICAL']),
            'low': len([r for r in result if r['status'] == 'LOW']),
            'items': serializer.data,
        })


class StockMovementReportView(APIView):
    """
    Stock movement summary report.

    Query params:
    - days: Number of days to look back (default: 7)
    - movement_type: Filter by type (SALE, PURCHASE, RETURN, ADJUSTMENT)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 7))
        movement_type = request.query_params.get('movement_type')
        start_date = timezone.now() - timedelta(days=days)

        queryset = StockMovement.objects.filter(timestamp__gte=start_date)

        if movement_type:
            queryset = queryset.filter(movement_type=movement_type)

        movements = queryset.annotate(
            date=TruncDate('timestamp')
        ).values('date', 'movement_type').annotate(
            total_movements=Count('id'),
            total_quantity=Sum('quantity_changed')
        ).order_by('-date', 'movement_type')

        result = []
        for m in movements:
            result.append({
                'date': m['date'],
                'movement_type': m['movement_type'],
                'total_movements': m['total_movements'],
                'total_quantity': m['total_quantity'],
            })

        serializer = StockMovementReportSerializer(result, many=True)
        return Response(serializer.data)


class DashboardView(APIView):
    """
    Dashboard summary with key metrics.
    Provides a quick overview of the business.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)
        month_start = now - timedelta(days=30)

        # Today's sales
        today_sales = Sale.objects.filter(created_at__gte=today_start)
        today_revenue = today_sales.aggregate(total=Coalesce(Sum('total_amount'), Decimal('0')))['total']
        today_count = today_sales.count()

        # This week's sales
        week_sales = Sale.objects.filter(created_at__gte=week_start)
        week_revenue = week_sales.aggregate(total=Coalesce(Sum('total_amount'), Decimal('0')))['total']
        week_count = week_sales.count()

        # This month's sales
        month_sales = Sale.objects.filter(created_at__gte=month_start)
        month_revenue = month_sales.aggregate(total=Coalesce(Sum('total_amount'), Decimal('0')))['total']
        month_count = month_sales.count()

        # Low stock count
        low_stock_count = StockLevel.objects.filter(quantity__lte=10).count()
        out_of_stock_count = StockLevel.objects.filter(quantity=0).count()

        # Total inventory value
        total_inventory_value = Decimal('0')
        for sl in StockLevel.objects.select_related('sku'):
            total_inventory_value += sl.quantity * sl.sku.base_price

        # Pending purchase orders
        from suppliers.models import PurchaseOrder
        pending_orders = PurchaseOrder.objects.filter(status='PENDING').count()

        return Response({
            'today': {
                'sales_count': today_count,
                'revenue': today_revenue,
            },
            'this_week': {
                'sales_count': week_count,
                'revenue': week_revenue,
            },
            'this_month': {
                'sales_count': month_count,
                'revenue': month_revenue,
            },
            'inventory': {
                'total_value': total_inventory_value,
                'low_stock_alerts': low_stock_count,
                'out_of_stock': out_of_stock_count,
            },
            'pending_purchase_orders': pending_orders,
            'stores_count': Store.objects.count(),
            'products_count': Product.objects.count(),
            'employees_count': Employee.objects.filter(is_active=True).count(),
        })
