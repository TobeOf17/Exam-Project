# backend/accounts/views.py

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    EmployeeSerializer,
    EmployeeRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer
)

Employee = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view with additional employee data."""
    serializer_class = CustomTokenObtainPairSerializer


class EmployeeRegistrationView(generics.CreateAPIView):
    """API endpoint for employee registration."""
    queryset = Employee.objects.all()
    serializer_class = EmployeeRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        employee = serializer.save()
        
        # Generate tokens for the new employee
        refresh = RefreshToken.for_user(employee)
        
        return Response({
            'employee': EmployeeSerializer(employee).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Employee registered successfully'
        }, status=status.HTTP_201_CREATED)


class EmployeeProfileView(generics.RetrieveUpdateAPIView):
    """API endpoint to get and update employee profile."""
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """API endpoint for changing employee password."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Set new password
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """API endpoint for employee logout (blacklist refresh token)."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({
                    'error': 'Refresh token is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                'message': 'Successfully logged out'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def test_token(request):
    """Test endpoint to verify token authentication."""
    return Response({
        'message': 'Token is valid',
        'employee': EmployeeSerializer(request.user).data
    })


class EmployeeListView(generics.ListAPIView):
    """API endpoint to list all employees (Manager only)."""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only managers can view all employees
        if self.request.user.is_manager or self.request.user.is_superuser:
            return Employee.objects.all().order_by('-date_joined')
        # Cashiers can only see themselves
        return Employee.objects.filter(id=self.request.user.id)


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint for employee detail (Manager only for others)."""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Managers can access all employees
        if self.request.user.is_manager or self.request.user.is_superuser:
            return Employee.objects.all()
        # Cashiers can only access their own profile
        return Employee.objects.filter(id=self.request.user.id)