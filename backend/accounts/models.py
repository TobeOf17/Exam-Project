from django.db import models
from django.contrib.auth.models import AbstractUser



class Employee(AbstractUser):


    class Role(models.TextChoices):
        CASHIER = 'CASHIER', 'Cashier'
        MANAGER = 'MANAGER', 'Manager'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.CASHIER,
        help_text="The functional role of the employee defining their permissions." [cite: 9]
    )

    
    store = models.ForeignKey(
        'inventory.Store', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='employees'
    )

    class Meta:
        verbose_name = "Employee"
        verbose_name_plural = "Employees"

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    
    @property
    def is_manager(self):
        
        return self.role == self.Role.MANAGER
