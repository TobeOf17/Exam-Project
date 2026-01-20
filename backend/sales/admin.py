from django.contrib import admin
from .models import Sale, SaleLine, Receipt, Return, Refund


class SaleLineInline(admin.TabularInline):
    model = SaleLine
    extra = 0
    readonly_fields = ('line_total',)

    def line_total(self, obj):
        return obj.quantity * obj.unit_price
    line_total.short_description = 'Total'


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'store', 'register', 'cashier', 'total_amount', 'payment_method', 'created_at')
    list_filter = ('store', 'payment_method', 'created_at')
    search_fields = ('cashier__username', 'store__name')
    ordering = ('-created_at',)
    inlines = [SaleLineInline]
    readonly_fields = ('created_at',)


@admin.register(SaleLine)
class SaleLineAdmin(admin.ModelAdmin):
    list_display = ('sale', 'sku', 'quantity', 'unit_price', 'line_total')
    list_filter = ('sale__store',)
    search_fields = ('sku__sku_code', 'sku__product__name')

    def line_total(self, obj):
        return obj.quantity * obj.unit_price
    line_total.short_description = 'Total'


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'sale', 'sale_date')
    search_fields = ('receipt_number',)
    ordering = ('-sale__created_at',)

    def sale_date(self, obj):
        return obj.sale.created_at
    sale_date.short_description = 'Date'
    sale_date.admin_order_field = 'sale__created_at'


@admin.register(Return)
class ReturnAdmin(admin.ModelAdmin):
    list_display = ('id', 'original_sale', 'reason', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('reason', 'original_sale__id')
    ordering = ('-created_at',)


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('id', 'return_record', 'amount')
    search_fields = ('return_record__id',)
