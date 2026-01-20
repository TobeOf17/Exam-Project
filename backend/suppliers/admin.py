from django.contrib import admin
from .models import Supplier, PurchaseOrder, PurchaseOrderLine


class PurchaseOrderLineInline(admin.TabularInline):
    model = PurchaseOrderLine
    extra = 1


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_info')
    search_fields = ('name', 'contact_info')
    ordering = ('name',)


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'supplier', 'status', 'created_at', 'line_count')
    list_filter = ('status', 'supplier', 'created_at')
    search_fields = ('supplier__name',)
    ordering = ('-created_at',)
    inlines = [PurchaseOrderLineInline]
    readonly_fields = ('created_at',)

    def line_count(self, obj):
        return obj.lines.count()
    line_count.short_description = 'Items'


@admin.register(PurchaseOrderLine)
class PurchaseOrderLineAdmin(admin.ModelAdmin):
    list_display = ('purchase_order', 'sku', 'quantity')
    list_filter = ('purchase_order__supplier',)
    search_fields = ('sku__sku_code', 'sku__product__name')
