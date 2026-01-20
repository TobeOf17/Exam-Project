import pytest
from sales.models import Sale, SaleLine, Receipt, Return, Refund
from inventory.models import Store, Register
from accounts.models import Employee
from products.models import Product, SKU # Import Product and SKU models

@pytest.mark.django_db
def test_create_sale():
    store = Store.objects.create(name="Main Store", location="123 Street")
    register = Register.objects.create(store=store, identifier="REG1")
    cashier = Employee.objects.create_user(username="timmy", password="password123")
    
    sale = Sale.objects.create(
        store=store,
        register=register,
        cashier=cashier,
        total_amount=100.00,
        payment_method="CASH"
    )
    
    assert sale.total_amount == 100.00
    assert sale.store == store
    assert sale.cashier == cashier

@pytest.mark.django_db
def test_create_sale_line():
    store = Store.objects.create(name="Main Store", location="123 Street")
    register = Register.objects.create(store=store, identifier="REG1")
    cashier = Employee.objects.create_user(username="timmy", password="password123")
    sale = Sale.objects.create(
        store=store,
        register=register,
        cashier=cashier,
        total_amount=100.00,
        payment_method="CASH"
    )
    # Create a real Product and SKU instance
    product = Product.objects.create(name="Test Product for Sale", description="Description for Sale Product")
    sku = SKU.objects.create(product=product, sku_code="TSKU004", barcode="1234567890126", base_price=25.00)
    
    line = SaleLine.objects.create(sale=sale, sku=sku, quantity=2, unit_price=50.00) # Pass sku object directly
    assert line.sale == sale
    assert line.quantity == 2
    assert line.unit_price == 50.00
    assert line.sku == sku # Assert the actual sku object

@pytest.mark.django_db
def test_create_receipt():
    store = Store.objects.create(name="Main Store", location="123 Street")
    register = Register.objects.create(store=store, identifier="REG1")
    cashier = Employee.objects.create_user(username="timmy", password="password123")
    sale = Sale.objects.create(
        store=store,
        register=register,
        cashier=cashier,
        total_amount=100.00,
        payment_method="CASH"
    )
    receipt = Receipt.objects.create(sale=sale, receipt_number="RCPT001")
    assert receipt.sale == sale
    assert receipt.receipt_number == "RCPT001"

@pytest.mark.django_db
def test_create_return_and_refund():
    store = Store.objects.create(name="Main Store", location="123 Street")
    register = Register.objects.create(store=store, identifier="REG1")
    cashier = Employee.objects.create_user(username="timmy", password="password123")
    sale = Sale.objects.create(
        store=store,
        register=register,
        cashier=cashier,
        total_amount=100.00,
        payment_method="CASH"
    )
    return_record = Return.objects.create(original_sale=sale, reason="Damaged item")
    refund = Refund.objects.create(return_record=return_record, amount=50.00)
    
    assert return_record.original_sale == sale
    assert refund.amount == 50.00
    assert refund.return_record == return_record
