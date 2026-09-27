from rest_framework import permissions
from rest_framework.exceptions import ValidationError
import uuid

class IsUserScoped(permissions.BasePermission):
    """
    Reads X-User-Id from request headers.
    Returns 400 if missing or invalid UUID.
    Makes the UUID available on the request as `request.user_id`.
    
    This is explicitly not a security boundary; it is an opaque scoping key.
    """
    def has_permission(self, request, view):
        user_id_header = request.headers.get('X-User-Id')
        if not user_id_header:
            raise ValidationError({'detail': 'Missing X-User-Id header'})
            
        try:
            # Validate it's a valid UUID
            user_id = uuid.UUID(user_id_header)
            request.user_id = user_id
            return True
        except ValueError:
            raise ValidationError({'detail': 'Invalid X-User-Id header format'})
            
    def has_object_permission(self, request, view, obj):
        # We also want to ensure they only access their own objects
        return hasattr(request, 'user_id') and obj.user_id == request.user_id
