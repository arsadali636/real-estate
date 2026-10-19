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
        user = self.request.user
        if user.is_manager_or_above:
            pass
        elif user.role == 'TEAM_LEAD':
            team_ids = list(user.team_members.values_list('id', flat=True)) + [user.id]
            qs = qs.filter(lead__assigned_agent_id__in=team_ids)
        else:
            qs = qs.filter(lead__assigned_agent=user)
        return qs
