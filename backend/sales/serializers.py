from rest_framework import serializers
from .models import Sale, SaleLine, Receipt, Return, Refund
from products.serializers import SKUSerializer


class SaleLineSerializer(serializers.ModelSerializer):
    """Serializer for sale line items."""
    
    sku_details = SKUSerializer(source='sku', read_only=True)
    line_total = serializers.SerializerMethodField()
    
    class Meta:
        model = SaleLine
        fields = [
            'id', 'sale', 'sku', 'sku_details', 'quantity', 
            'unit_price', 'line_total'
        ]
        read_only_fields = ['id']
    
    def get_line_total(self, obj):
        """Calculate line total (quantity * unit_price)."""
        return obj.quantity * obj.unit_price


class SaleLineCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating sale line items."""
    
    class Meta:
        model = SaleLine
        fields = ['sku', 'quantity', 'unit_price']
    
    def validate_quantity(self, value):
        """Ensure quantity is positive."""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_unit_price(self, value):
        """Ensure unit price is positive."""
        if value <= 0:
            raise serializers.ValidationError("Unit price must be greater than 0")
        return value


class SaleSerializer(serializers.ModelSerializer):
    """Serializer for Sale model (read)."""
    
    lines = SaleLineSerializer(many=True, read_only=True)
    cashier_name = serializers.CharField(source='cashier.get_full_name', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    register_identifier = serializers.CharField(source='register.identifier', read_only=True)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'store', 'store_name', 'register', 'register_identifier',
            'cashier', 'cashier_name', 'total_amount', 'payment_method',
            'created_at', 'lines'
        ]
        read_only_fields = ['id', 'created_at']


class SaleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new sale."""
    
    lines = SaleLineCreateSerializer(many=True)
    
    class Meta:
        model = Sale
        fields = [
            'store', 'register', 'cashier', 'total_amount', 
            'payment_method', 'lines'
        ]
    
    def validate_total_amount(self, value):
        """Ensure total amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Total amount must be greater than 0")
        return value
    
    def validate_payment_method(self, value):
        """Validate payment method."""
        valid_methods = ['CASH', 'CARD', 'MOBILE', 'OTHER']
        if value.upper() not in valid_methods:
            raise serializers.ValidationError(
                f"Invalid payment method. Must be one of: {', '.join(valid_methods)}"
            )
        return value.upper()
    
    def validate(self, attrs):
        """
        Validate that the total_amount matches the sum of line items.
        """
        lines = attrs.get('lines', [])
        
        if not lines:
            raise serializers.ValidationError({
                'lines': 'At least one line item is required'
            })
        
        # Calculate expected total
        calculated_total = sum(
            line['quantity'] * line['unit_price'] 
            for line in lines
        )
        
        # Allow small rounding differences
        if abs(calculated_total - attrs['total_amount']) > 0.01:
            raise serializers.ValidationError({
                'total_amount': f'Total amount ({attrs["total_amount"]}) does not match '
                               f'sum of line items ({calculated_total})'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create sale with line items."""
        lines_data = validated_data.pop('lines')
        
        # Create the sale
        sale = Sale.objects.create(**validated_data)
        
        # Create line items
        for line_data in lines_data:
            SaleLine.objects.create(sale=sale, **line_data)
        
        return sale


class ReceiptSerializer(serializers.ModelSerializer):
    """Serializer for Receipt model."""
    
    sale = SaleSerializer(read_only=True)
    
    class Meta:
        model = Receipt
        fields = ['id', 'sale', 'receipt_number']
        read_only_fields = ['id']


class ReturnSerializer(serializers.ModelSerializer):
    """Serializer for Return model."""
    
    original_sale = SaleSerializer(read_only=True)
    original_sale_id = serializers.PrimaryKeyRelatedField(
        queryset=Sale.objects.all(),
        source='original_sale',
        write_only=True
    )
    
    class Meta:
        model = Return
        fields = [
            'id', 'original_sale', 'original_sale_id', 
            'reason', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_reason(self, value):
        """Ensure reason is provided."""
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Return reason must be at least 3 characters long"
            )
        return value


class RefundSerializer(serializers.ModelSerializer):
    """Serializer for Refund model."""
    
    return_record = ReturnSerializer(read_only=True)
    
    class Meta:
        model = Refund
        fields = ['id', 'return_record', 'amount']
        read_only_fields = ['id']