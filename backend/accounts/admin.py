from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'store', 'is_active')
    list_filter = ('role', 'is_active', 'store')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)

    fieldsets = UserAdmin.fieldsets + (
        ('Employee Info', {'fields': ('role', 'store')}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Employee Info', {'fields': ('role', 'store')}),
    )
