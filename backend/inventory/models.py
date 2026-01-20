from django.db import models
from django.core.validators import MinValueValidator

class Store(models.Model):
    
    name = models.CharField(max_length=255)
    location = models.TextField()

    def __str__(self):
        return self.name

class Register(models.Model):
    
    store = models.ForeignKey(Store, related_name='registers', on_delete=models.CASCADE) 
    identifier = models.CharField(max_length=50)

class StockLevel(models.Model):
    
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    sku = models.ForeignKey('products.SKU', on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)]) 

    class Meta:
        unique_together = ('store', 'sku') 

class StockMovement(models.Model):
    
    stock_level = models.ForeignKey(StockLevel, related_name='movements', on_delete=models.CASCADE) 
    movement_type = models.CharField(max_length=20, choices=[
        ('SALE', 'Sale'), ('PURCHASE', 'Purchase'), ('RETURN', 'Return'), ('ADJUSTMENT', 'Adjustment')
    ])
    quantity_changed = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)