from django.contrib import admin
from .models import Store, Register, StockLevel, StockMovement


class RegisterInline(admin.TabularInline):
    model = Register
    extra = 1


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'register_count')
    search_fields = ('name', 'location')
    inlines = [RegisterInline]

    def register_count(self, obj):
        return obj.registers.count()
    register_count.short_description = 'Registers'


@admin.register(Register)
class RegisterAdmin(admin.ModelAdmin):
    list_display = ('identifier', 'store')
    list_filter = ('store',)
    search_fields = ('identifier', 'store__name')


@admin.register(StockLevel)
class StockLevelAdmin(admin.ModelAdmin):
    list_display = ('store', 'sku', 'quantity', 'is_low_stock')
    list_filter = ('store',)
    search_fields = ('store__name', 'sku__sku_code', 'sku__product__name')
    ordering = ('store', 'sku')

    def is_low_stock(self, obj):
        return obj.quantity <= 10
    is_low_stock.boolean = True
    is_low_stock.short_description = 'Low Stock'


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'stock_level', 'movement_type', 'quantity_changed')
    list_filter = ('movement_type', 'timestamp')
    search_fields = ('stock_level__sku__sku_code', 'stock_level__store__name')
    ordering = ('-timestamp',)
    readonly_fields = ('timestamp',)
