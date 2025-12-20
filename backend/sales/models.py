from django.db import models


class Sale(models.Model):
    
    store = models.ForeignKey('inventory.Store', on_delete=models.PROTECT)
    register = models.ForeignKey('inventory.Register', on_delete=models.PROTECT)
    cashier = models.ForeignKey('accounts.Employee', on_delete=models.PROTECT)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2) [cite: 9]
    payment_method = models.CharField(max_length=20) [cite: 9]
    created_at = models.DateTimeField(auto_now_add=True)

class SaleLine(models.Model):
    
    sale = models.ForeignKey(Sale, related_name='lines', on_delete=models.CASCADE) [cite: 6]
    sku = models.ForeignKey('products.SKU', on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

class Receipt(models.Model):
    
    sale = models.OneToOneField(Sale, on_delete=models.CASCADE) [cite: 6]
    receipt_number = models.CharField(max_length=100, unique=True)

class Return(models.Model):
    
    original_sale = models.ForeignKey(Sale, on_delete=models.PROTECT)
    reason = models.CharField(max_length=255) [cite: 9]
    created_at = models.DateTimeField(auto_now_add=True)

class Refund(models.Model):
    
    return_record = models.OneToOneField(Return, on_delete=models.CASCADE) [cite: 6]
    amount = models.DecimalField(max_digits=10, decimal_places=2)