from django.db import models

class Supplier(models.Model):
    
    name = models.CharField(max_length=255)
    contact_info = models.TextField()

class PurchaseOrder(models.Model):
    
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

class PurchaseOrderLine(models.Model):
    
    purchase_order = models.ForeignKey(PurchaseOrder, related_name='lines', on_delete=models.CASCADE)
    sku = models.ForeignKey('products.SKU', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()