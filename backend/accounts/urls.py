# backend/accounts/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    EmployeeRegistrationView,
    EmployeeProfileView,
    ChangePasswordView,
    LogoutView,
    test_token,
    EmployeeListView,
    EmployeeDetailView,
)

app_name = 'accounts'

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', EmployeeRegistrationView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/test-token/', test_token, name='test_token'),
    
    # Employee profile endpoints
    path('profile/', EmployeeProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Employee management endpoints (Manager access)
    path('employees/', EmployeeListView.as_view(), name='employee_list'),
    path('employees/<int:pk>/', EmployeeDetailView.as_view(), name='employee_detail'),
]