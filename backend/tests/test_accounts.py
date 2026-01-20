import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
def test_create_employee():
    # Create an employee
    employee = User.objects.create_user(
        username="timmy",
        password="password123",
        role=User.Role.CASHIER
    )
    assert employee.username == "timmy"
    assert employee.role == User.Role.CASHIER
    assert not employee.is_manager  # CASHIER is not manager

@pytest.mark.django_db
def test_manager_property():
    # Create a manager
    manager = User.objects.create_user(
        username="tumi",
        password="securepass",
        role=User.Role.MANAGER
    )
    assert manager.is_manager  # This should be True
