from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import SiteVisit
from .serializers import SiteVisitSerializer
from activities.models import LeadActivity
from accounts.permissions import get_user_org

class SiteVisitViewSet(viewsets.ModelViewSet):
    serializer_class = SiteVisitSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'assigned_executive', 'project', 'lead']
    search_fields = ['lead__full_name', 'project__name', 'notes', 'outcome']
    ordering_fields = ['scheduled_datetime', 'created_at']
    ordering = ['scheduled_datetime']

    def get_queryset(self):
        org = get_user_org(self.request)
        if not org:
            return SiteVisit.objects.none()
        qs = SiteVisit.objects.filter(organization=org).select_related(
            'lead', 'project', 'assigned_executive'
        )

        # Role enforcement
        if not self.request.user.is_manager_or_above:
            qs = qs.filter(assigned_executive=self.request.user)

        # Date filter
        status_filter = self.request.query_params.get('status_filter')
        now = timezone.now()
        if status_filter == 'upcoming':
            qs = qs.filter(scheduled_datetime__gte=now, status='Scheduled')
        elif status_filter == 'past':
            qs = qs.filter(status__in=['Completed', 'Cancelled', 'No-show'])

        return qs

    def perform_create(self, serializer):
        org = get_user_org(self.request)
        assigned_executive = serializer.validated_data.get('assigned_executive')
        if not assigned_executive:
            assigned_executive = self.request.user

        visit = serializer.save(
            organization=org,
            assigned_executive=assigned_executive
        )

        # Automatically update lead status to 'Site Visit Scheduled' if prior to visit
        lead = visit.lead
        if lead.status in ['New', 'Contacted', 'Interested']:
            lead.status = 'Site Visit Scheduled'
            lead.save()

        # Log activity
        LeadActivity.objects.create(
            organization=org,
            lead=lead,
            performed_by=self.request.user,
            activity_type='Site Visit Scheduled',
            title=f"Site visit scheduled at {visit.project.name}",
            description=f"Scheduled for {visit.scheduled_datetime.strftime('%Y-%m-%d %H:%M')} with executive {assigned_executive.display_name}. Notes: {visit.notes}"
        )

    @action(detail=True, methods=['post'], url_path='reschedule')
    def reschedule_visit(self, request, pk=None):
        visit = self.get_object()
        new_datetime = request.data.get('scheduled_datetime')
        if not new_datetime:
            return Response({'error': 'Please provide the new scheduled date and time.'}, status=status.HTTP_400_BAD_REQUEST)

        visit.scheduled_datetime = new_datetime
        visit.status = 'Scheduled'
        visit.save()

        LeadActivity.objects.create(
            organization=visit.organization,
            lead=visit.lead,
            performed_by=request.user,
            activity_type='Site Visit Scheduled',
            title=f"Site visit rescheduled at {visit.project.name}",
            description=f"New appointment: {new_datetime} by {request.user.display_name}."
        )

        return Response({
            'message': 'Site visit rescheduled successfully.',
            'site_visit': SiteVisitSerializer(visit).data
        })

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        visit = self.get_object()
        new_status = request.data.get('status')
        outcome = request.data.get('outcome', '').strip()

        valid_statuses = ['Completed', 'Cancelled', 'No-show']
        if new_status not in valid_statuses:
            return Response(
                {'error': f"Invalid status. Allowed: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        visit.status = new_status
        visit.outcome = outcome
        if new_status == 'Completed':
            visit.completed_at = timezone.now()
            # If lead was in Site Visit Scheduled, promote to Site Visit Done
            if visit.lead.status == 'Site Visit Scheduled':
                visit.lead.status = 'Site Visit Done'
                visit.lead.save()

        visit.save()

        LeadActivity.objects.create(
            organization=visit.organization,
            lead=visit.lead,
            performed_by=request.user,
            activity_type='Site Visit Completed' if new_status == 'Completed' else 'Status Changed',
            title=f"Site visit marked as {new_status}",
            description=f"Recorded by {request.user.display_name}. Outcome: {outcome or 'No outcome note recorded.'}"
        )

        return Response({
            'message': f"Site visit updated to {new_status}.",
            'site_visit': SiteVisitSerializer(visit).data
        })
