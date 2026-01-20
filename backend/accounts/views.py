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
from .permissions import IsManager, IsOwnerOrManager

Employee = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view with additional employee data."""
    serializer_class = CustomTokenObtainPairSerializer


class EmployeeRegistrationView(generics.CreateAPIView):
    """
    API endpoint for employee registration.
    Only managers can register new employees.
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeRegistrationSerializer
    permission_classes = [IsManager]  # Only managers can register
    
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
    """
    API endpoint to get and update employee profile.
    Users can only update their own profile.
    """
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        # Prevent users from changing their own role
        if 'role' in request.data and not request.user.is_manager:
            return Response({
                'error': 'Only managers can change roles'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)


class ChangePasswordView(APIView):
    """API endpoint for changing employee password."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
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
    """
    API endpoint to list all employees.
    Managers: Can see all employees
    Cashiers: Can only see themselves
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Managers and superusers can view all employees
        if self.request.user.is_manager or self.request.user.is_superuser:
            return Employee.objects.all().order_by('-date_joined')
        
        # Cashiers can only see themselves
        return Employee.objects.filter(id=self.request.user.id)


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for employee detail.
    Managers: Can view/edit/delete any employee
    Cashiers: Can only view/edit their own profile
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrManager]
    
    def get_queryset(self):
        # Managers can access all employees
        if self.request.user.is_manager or self.request.user.is_superuser:
            return Employee.objects.all()
        
        # Cashiers can only access their own profile
        return Employee.objects.filter(id=self.request.user.id)
    
    def update(self, request, *args, **kwargs):
        employee = self.get_object()
        
        # Prevent non-managers from changing roles
        if 'role' in request.data and not request.user.is_manager:
            return Response({
                'error': 'Only managers can change employee roles'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Prevent employees from changing their own role
        if 'role' in request.data and employee == request.user:
            return Response({
                'error': 'You cannot change your own role'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        employee = self.get_object()
        
        # Prevent self-deletion
        if employee == request.user:
            return Response({
                'error': 'You cannot delete your own account'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().destroy(request, *args, **kwargs)