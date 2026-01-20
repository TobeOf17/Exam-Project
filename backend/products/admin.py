from django.contrib import admin
from .models import Product, SKU


class SKUInline(admin.TabularInline):
    model = SKU
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at', 'sku_count')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)
    inlines = [SKUInline]

    def sku_count(self, obj):
        return obj.skus.count()
    sku_count.short_description = 'SKUs'


@admin.register(SKU)
class SKUAdmin(admin.ModelAdmin):
    list_display = ('sku_code', 'product', 'barcode', 'base_price')
    list_filter = ('product',)
    search_fields = ('sku_code', 'barcode', 'product__name')
    ordering = ('sku_code',)
