import pytest
from inventory.models import Store, Register, StockLevel, StockMovement
from products.models import Product, SKU # Import Product and SKU models

@pytest.mark.django_db
def test_create_store():
    store = Store.objects.create(name="Main Store", location="123 Street")
    assert store.name == "Main Store"

@pytest.mark.django_db
def test_create_register():
    store = Store.objects.create(name="Main Store", location="123 Street")
    register = Register.objects.create(store=store, identifier="REG1")
    assert register.store == store
    assert register.identifier == "REG1"

@pytest.mark.django_db
def test_create_stock_level():
    store = Store.objects.create(name="Main Store", location="123 Street")
    
    # Create a real Product and SKU instance
    product = Product.objects.create(name="Test Product for Stock", description="Description for Stock Product")
    sku = SKU.objects.create(product=product, sku_code="TSKU002", barcode="1234567890124", base_price=15.00)
    
    stock = StockLevel.objects.create(store=store, sku=sku, quantity=10) # Pass sku object directly
    assert stock.quantity == 10
    assert stock.store == store
    assert stock.sku == sku # Assert the actual sku object

@pytest.mark.django_db
def test_create_stock_movement():
    store = Store.objects.create(name="Main Store", location="123 Street")
    
    # Create a real Product and SKU instance
    product = Product.objects.create(name="Test Product for Movement", description="Description for Movement Product")
    sku = SKU.objects.create(product=product, sku_code="TSKU003", barcode="1234567890125", base_price=20.00)
    
    stock = StockLevel.objects.create(store=store, sku=sku, quantity=10) # Pass sku object directly
    movement = StockMovement.objects.create(
        stock_level=stock,
        movement_type="SALE",
        quantity_changed=2
    )
    assert movement.stock_level == stock
    assert movement.quantity_changed == 2
    assert movement.movement_type == "SALE"
