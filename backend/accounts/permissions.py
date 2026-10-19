from rest_framework import permissions

def get_user_org(request):
    if not request.user or not request.user.is_authenticated:
        return None
    return getattr(request.user, 'organization', None)

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_owner_or_admin

class IsManagerOrAbove(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_manager_or_above

class IsTeamLeadOrAbove(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_team_lead_or_above

class OrganizationScopedPermission(permissions.BasePermission):
    """
    Ensures objects belong to the authenticated user's organization.
    """
    def has_object_permission(self, request, view, obj):
        org = get_user_org(request)
        if not org:
            return False
        obj_org = getattr(obj, 'organization', None)
        return obj_org == org
