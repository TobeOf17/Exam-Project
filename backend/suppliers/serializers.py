from rest_framework import serializers
from .models import Supplier, PurchaseOrder, PurchaseOrderLine
from products.serializers import SKUSerializer


class SupplierSerializer(serializers.ModelSerializer):
    """Serializer for Supplier model."""

    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_info']
        read_only_fields = ['id']


class PurchaseOrderLineSerializer(serializers.ModelSerializer):
    """Serializer for PurchaseOrderLine model."""

    sku_details = SKUSerializer(source='sku', read_only=True)

    class Meta:
        model = PurchaseOrderLine
        fields = ['id', 'purchase_order', 'sku', 'sku_details', 'quantity']
        read_only_fields = ['id']


class PurchaseOrderLineCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating PurchaseOrderLine."""

    class Meta:
        model = PurchaseOrderLine
        fields = ['sku', 'quantity']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    """Serializer for PurchaseOrder model (read)."""

    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    lines = PurchaseOrderLineSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'supplier', 'supplier_name', 'status', 'created_at', 'lines', 'total_items']
        read_only_fields = ['id', 'created_at']

    def get_total_items(self, obj):
        return sum(line.quantity for line in obj.lines.all())


class PurchaseOrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating PurchaseOrder with lines."""

    lines = PurchaseOrderLineCreateSerializer(many=True)

    class Meta:
        model = PurchaseOrder
        fields = ['supplier', 'status', 'lines']

    def validate_lines(self, value):
        if not value:
            raise serializers.ValidationError("At least one line item is required")
        return value

    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        purchase_order = PurchaseOrder.objects.create(**validated_data)

        for line_data in lines_data:
            PurchaseOrderLine.objects.create(purchase_order=purchase_order, **line_data)

        return purchase_order
