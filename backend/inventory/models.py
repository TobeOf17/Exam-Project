from django.db import models
from django.core.validators import MinValueValidator

class Store(models.Model):
    
    name = models.CharField(max_length=255)
    location = models.TextField()

    def __str__(self):
        return self.name

class Register(models.Model):
    
    store = models.ForeignKey(Store, related_name='registers', on_delete=models.CASCADE) [cite: 6]
    identifier = models.CharField(max_length=50)

class StockLevel(models.Model):
    6
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    sku = models.ForeignKey('products.SKU', on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)]) [cite: 9]

    class Meta:
        unique_together = ('store', 'sku') 

class StockMovement(models.Model):
    
    stock_level = models.ForeignKey(StockLevel, related_name='movements', on_delete=models.CASCADE) [cite: 6]
    movement_type = models.CharField(max_length=20, choices=[
        ('SALE', 'Sale'), ('PURCHASE', 'Purchase'), ('RETURN', 'Return'), ('ADJUSTMENT', 'Adjustment')
    ]) [cite: 9]
    quantity_changed = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)