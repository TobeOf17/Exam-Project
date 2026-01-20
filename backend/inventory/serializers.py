from rest_framework import serializers
from .models import Store, Register, StockLevel, StockMovement
from products.serializers import SKUSerializer


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for Register model."""
    
    store_name = serializers.CharField(source='store.name', read_only=True)
    
    class Meta:
        model = Register
        fields = ['id', 'store', 'store_name', 'identifier']
        read_only_fields = ['id']


class StoreSerializer(serializers.ModelSerializer):
    """Serializer for Store model."""
    
    registers = RegisterSerializer(many=True, read_only=True)
    register_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Store
        fields = ['id', 'name', 'location', 'registers', 'register_count']
        read_only_fields = ['id']
    
    def get_register_count(self, obj):
        """Get number of registers in this store."""
        return obj.registers.count()


class StockLevelSerializer(serializers.ModelSerializer):
    """Serializer for StockLevel model."""
    
    sku_details = SKUSerializer(source='sku', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    product_name = serializers.CharField(source='sku.product.name', read_only=True)
    is_low_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = StockLevel
        fields = [
            'id', 'store', 'store_name', 'sku', 'sku_details', 
            'product_name', 'quantity', 'is_low_stock'
        ]
        read_only_fields = ['id']
    
    def get_is_low_stock(self, obj):
        """Check if stock is low (threshold: 10)."""
        return obj.quantity <= 10
    
    def validate_quantity(self, value):
        """Ensure quantity is not negative."""
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative")
        return value


class StockAdjustmentSerializer(serializers.Serializer):
    """Serializer for stock adjustment requests."""
    
    store_id = serializers.IntegerField()
    sku_id = serializers.IntegerField()
    quantity_change = serializers.IntegerField()
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True)
    
    def validate_store_id(self, value):
        """Validate store exists."""
        from .models import Store
        if not Store.objects.filter(id=value).exists():
            raise serializers.ValidationError("Store not found")
        return value
    
    def validate_sku_id(self, value):
        """Validate SKU exists."""
        from products.models import SKU
        if not SKU.objects.filter(id=value).exists():
            raise serializers.ValidationError("SKU not found")
        return value
    
    def validate_quantity_change(self, value):
        """Ensure quantity change is not zero."""
        if value == 0:
            raise serializers.ValidationError("Quantity change cannot be zero")
        return value


class StockMovementSerializer(serializers.ModelSerializer):
    """Serializer for StockMovement model."""
    
    store_name = serializers.CharField(source='stock_level.store.name', read_only=True)
    product_name = serializers.CharField(source='stock_level.sku.product.name', read_only=True)
    sku_code = serializers.CharField(source='stock_level.sku.sku_code', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'stock_level', 'store_name', 'product_name', 'sku_code',
            'movement_type', 'movement_type_display', 'quantity_changed', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']