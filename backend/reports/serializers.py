from rest_framework import serializers
from sales.models import Sale, SaleLine
from products.models import Product, SKU
from inventory.models import Store, StockLevel
from accounts.models import Employee


class SalesSummarySerializer(serializers.Serializer):
    """Serializer for sales summary data."""
    period = serializers.CharField()
    start_date = serializers.DateTimeField()
    end_date = serializers.DateTimeField()
    total_sales = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_items_sold = serializers.IntegerField()
    average_sale = serializers.DecimalField(max_digits=10, decimal_places=2)


class DailySalesSerializer(serializers.Serializer):
    """Serializer for daily sales breakdown."""
    date = serializers.DateField()
    total_sales = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_items = serializers.IntegerField()


class TopProductSerializer(serializers.Serializer):
    """Serializer for top selling products."""
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    total_quantity = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    transaction_count = serializers.IntegerField()


class SalesByStoreSerializer(serializers.Serializer):
    """Serializer for sales by store."""
    store_id = serializers.IntegerField()
    store_name = serializers.CharField()
    total_sales = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_sale = serializers.DecimalField(max_digits=10, decimal_places=2)


class SalesByEmployeeSerializer(serializers.Serializer):
    """Serializer for sales by employee."""
    employee_id = serializers.IntegerField()
    employee_name = serializers.CharField()
    role = serializers.CharField()
    total_sales = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_sale = serializers.DecimalField(max_digits=10, decimal_places=2)


class SalesByPaymentMethodSerializer(serializers.Serializer):
    """Serializer for sales by payment method."""
    payment_method = serializers.CharField()
    total_sales = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2)


class InventoryValueSerializer(serializers.Serializer):
    """Serializer for inventory valuation."""
    store_id = serializers.IntegerField()
    store_name = serializers.CharField()
    total_items = serializers.IntegerField()
    total_skus = serializers.IntegerField()
    total_value = serializers.DecimalField(max_digits=12, decimal_places=2)


class InventoryItemSerializer(serializers.Serializer):
    """Serializer for individual inventory items."""
    sku_id = serializers.IntegerField()
    sku_code = serializers.CharField()
    product_name = serializers.CharField()
    store_name = serializers.CharField()
    quantity = serializers.IntegerField()
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_value = serializers.DecimalField(max_digits=12, decimal_places=2)


class LowStockAlertSerializer(serializers.Serializer):
    """Serializer for low stock alerts."""
    sku_id = serializers.IntegerField()
    sku_code = serializers.CharField()
    product_name = serializers.CharField()
    store_id = serializers.IntegerField()
    store_name = serializers.CharField()
    current_quantity = serializers.IntegerField()
    threshold = serializers.IntegerField()
    status = serializers.CharField()  # LOW, CRITICAL, OUT_OF_STOCK


class StockMovementReportSerializer(serializers.Serializer):
    """Serializer for stock movement report."""
    date = serializers.DateField()
    movement_type = serializers.CharField()
    total_movements = serializers.IntegerField()
    total_quantity = serializers.IntegerField()


class HourlySalesSerializer(serializers.Serializer):
    """Serializer for hourly sales breakdown."""
    hour = serializers.IntegerField()
    total_sales = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
