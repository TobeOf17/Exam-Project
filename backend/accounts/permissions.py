from rest_framework import permissions


class IsManager(permissions.BasePermission):
    """
    Permission class to check if user is a Manager.
    """
    message = "Only managers can perform this action."
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers always have permission
        if request.user.is_superuser:
            return True
        
        # Check if user is a manager
        return request.user.is_manager


class IsCashier(permissions.BasePermission):
    """
    Permission class to check if user is a Cashier.
    """
    message = "Only cashiers can perform this action."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        return request.user.role == request.user.Role.CASHIER


class IsManagerOrReadOnly(permissions.BasePermission):
    """
    Managers can do anything.
    Cashiers can only read (GET, HEAD, OPTIONS).
    """
    message = "You don't have permission to modify this resource."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers always have permission
        if request.user.is_superuser:
            return True
        
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        
        # Write permissions only for managers
        return request.user.is_manager


class IsOwnerOrManager(permissions.BasePermission):
    """
    Object-level permission.
    Users can only edit their own data, managers can edit anyone's.
    """
    message = "You can only modify your own data."
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers and managers have full access
        if request.user.is_superuser or request.user.is_manager:
            return True
        
        # Read permissions for all
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for owner
        return obj == request.user or obj.created_by == request.user