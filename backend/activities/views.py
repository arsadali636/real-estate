from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import LeadActivity
from .serializers import LeadActivitySerializer
from accounts.permissions import get_user_org

class LeadActivityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LeadActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['lead', 'activity_type', 'performed_by']
    search_fields = ['title', 'description', 'lead__full_name']
    ordering = ['-created_at']

    def get_queryset(self):
        org = get_user_org(self.request)
        if not org:
            return LeadActivity.objects.none()
        qs = LeadActivity.objects.filter(organization=org).select_related('lead', 'performed_by')
        # If executive, only show activities on leads assigned to them
        if not self.request.user.is_manager_or_above:
            qs = qs.filter(lead__assigned_agent=self.request.user)
        return qs
