from django.db import models

class Product(models.Model):
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class SKU(models.Model):
    
    product = models.ForeignKey(Product, related_name='skus', on_delete=models.CASCADE) [cite: 6]
    sku_code = models.CharField(max_length=100, unique=True)
    barcode = models.CharField(max_length=100, unique=True) 
    base_price = models.DecimalField(max_digits=10, decimal_places=2) 

    def __str__(self):
        return f"{self.product.name} - {self.sku_code}"
