from rest_framework import serializers
from .models import Product, SKU


class SKUSerializer(serializers.ModelSerializer):
    """Serializer for SKU model."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = SKU
        fields = [
            'id', 'product', 'product_name', 'sku_code', 
            'barcode', 'base_price'
        ]
        read_only_fields = ['id']
    
    def validate_sku_code(self, value):
        """Ensure SKU code is unique."""
        if SKU.objects.filter(sku_code=value).exists():
            if self.instance and self.instance.sku_code == value:
                return value
            raise serializers.ValidationError("SKU code already exists")
        return value
    
    def validate_barcode(self, value):
        """Ensure barcode is unique."""
        if SKU.objects.filter(barcode=value).exists():
            if self.instance and self.instance.barcode == value:
                return value
            raise serializers.ValidationError("Barcode already exists")
        return value
    
    def validate_base_price(self, value):
        """Ensure price is positive."""
        if value <= 0:
            raise serializers.ValidationError("Base price must be greater than 0")
        return value


class SKUCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating SKUs (used when creating product with SKUs)."""
    
    class Meta:
        model = SKU
        fields = ['sku_code', 'barcode', 'base_price']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model (list view)."""
    
    sku_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'created_at', 'sku_count']
        read_only_fields = ['id', 'created_at']
    
    def get_sku_count(self, obj):
        """Get number of SKUs for this product."""
        return obj.skus.count()


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for Product model (detail view with SKUs)."""
    
    skus = SKUSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'created_at', 'skus']
        read_only_fields = ['id', 'created_at']


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a product with SKUs."""
    
    skus = SKUCreateSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = ['name', 'description', 'skus']
    
    def create(self, validated_data):
        """Create product with SKUs."""
        skus_data = validated_data.pop('skus', [])
        
        # Create the product
        product = Product.objects.create(**validated_data)
        
        # Create SKUs if provided
        for sku_data in skus_data:
            SKU.objects.create(product=product, **sku_data)
        
        return product