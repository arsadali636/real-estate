from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import FollowUpTask
from .serializers import FollowUpTaskSerializer
from activities.models import LeadActivity
from accounts.permissions import get_user_org

class FollowUpTaskViewSet(viewsets.ModelViewSet):
    serializer_class = FollowUpTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'task_type', 'priority', 'assigned_to', 'lead']
    search_fields = ['notes', 'outcome', 'lead__full_name', 'lead__phone']
    ordering_fields = ['due_datetime', 'created_at', 'priority']
    ordering = ['due_datetime']

    def get_queryset(self):
        org = get_user_org(self.request)
        if not org:
            return FollowUpTask.objects.none()
        qs = FollowUpTask.objects.filter(organization=org).select_related(
            'lead', 'assigned_to', 'lead__interested_project'
        )

        # Enforce server-side role permissions
        user = self.request.user
        if user.is_manager_or_above:
            pass  # Owner and Manager see all tasks
        elif user.role == 'TEAM_LEAD':
            team_ids = list(user.team_members.values_list('id', flat=True)) + [user.id]
            qs = qs.filter(assigned_to_id__in=team_ids)
        else:
            qs = qs.filter(assigned_to=user)

        # Due filter options: today, overdue, upcoming, completed
        due_filter = self.request.query_params.get('due_filter')
        now = timezone.now()
        if due_filter == 'today':
            qs = qs.filter(due_datetime__date=now.date(), status='Pending')
        elif due_filter == 'overdue':
            qs = qs.filter(due_datetime__lt=now, status='Pending')
        elif due_filter == 'upcoming':
            qs = qs.filter(due_datetime__gt=now, status='Pending')
        elif due_filter == 'completed':
            qs = qs.filter(status='Completed')

        return qs

    def perform_create(self, serializer):
        org = get_user_org(self.request)
        assigned_to = serializer.validated_data.get('assigned_to')
        if not assigned_to:
            assigned_to = self.request.user

        task = serializer.save(
            organization=org,
            created_by=self.request.user,
            assigned_to=assigned_to
        )

        # Update lead next_followup_date
        lead = task.lead
        lead.next_followup_date = task.due_datetime
        lead.save()

        # Log activity
        LeadActivity.objects.create(
            organization=org,
            lead=lead,
            performed_by=self.request.user,
            activity_type='Follow-up Scheduled',
            title=f"Follow-up scheduled: {task.task_type}",
            description=f"Due {task.due_datetime.strftime('%Y-%m-%d %H:%M')} with {lead.full_name}. Notes: {task.notes}"
        )

    @action(detail=True, methods=['post'], url_path='complete')
    def complete_task(self, request, pk=None):
        task = self.get_object()
        outcome = request.data.get('outcome', '').strip()

        task.status = 'Completed'
        task.outcome = outcome
        task.completed_at = timezone.now()
        task.save()

        # Log activity
        LeadActivity.objects.create(
            organization=task.organization,
            lead=task.lead,
            performed_by=request.user,
            activity_type='Follow-up Completed',
            title=f"Follow-up completed: {task.task_type}",
            description=f"Completed by {request.user.display_name}. Outcome: {outcome or 'Follow-up marked completed.'}"
        )

        return Response({
            'message': 'Follow-up marked as completed.',
            'task': FollowUpTaskSerializer(task).data
        })

    @action(detail=True, methods=['post'], url_path='reschedule')
    def reschedule_task(self, request, pk=None):
        task = self.get_object()
        new_datetime = request.data.get('due_datetime')
        if not new_datetime:
            return Response({'error': 'Please provide the new due date and time.'}, status=status.HTTP_400_BAD_REQUEST)

        task.due_datetime = new_datetime
        task.status = 'Pending'
        task.save()

        # Update lead
        task.lead.next_followup_date = new_datetime
        task.lead.save()

        LeadActivity.objects.create(
            organization=task.organization,
            lead=task.lead,
            performed_by=request.user,
            activity_type='Follow-up Scheduled',
            title=f"Follow-up rescheduled to {new_datetime}",
            description=f"Rescheduled by {request.user.display_name}."
        )

        return Response({
            'message': 'Follow-up rescheduled successfully.',
            'task': FollowUpTaskSerializer(task).data
        })
