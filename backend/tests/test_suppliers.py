import pytest
from suppliers.models import Supplier, PurchaseOrder, PurchaseOrderLine
from products.models import SKU, Product  # import the real SKU model

@pytest.mark.django_db
def test_create_supplier():
    supplier = Supplier.objects.create(name="ABC Supplies", contact_info="abc@example.com")
    assert supplier.name == "ABC Supplies"

@pytest.mark.django_db
def test_create_purchase_order():
    supplier = Supplier.objects.create(name="ABC Supplies", contact_info="abc@example.com")
    po = PurchaseOrder.objects.create(supplier=supplier, status="PENDING")
    assert po.supplier == supplier
    assert po.status == "PENDING"

@pytest.mark.django_db
def test_create_purchase_order_line():
    supplier = Supplier.objects.create(name="ABC Supplies", contact_info="abc@example.com")
    po = PurchaseOrder.objects.create(supplier=supplier, status="PENDING")
    
    # Create a real SKU instance
    product = Product.objects.create(name="Test Product", description="Description for Test Product")
    sku = SKU.objects.create(product=product, sku_code="TSKU001", barcode="1234567890123", base_price=10.00)
    
    line = PurchaseOrderLine.objects.create(purchase_order=po, sku=sku, quantity=5)
    assert line.purchase_order == po
    assert line.sku == sku
    assert line.quantity == 5
