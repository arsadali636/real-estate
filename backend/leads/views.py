from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from decimal import Decimal

from .models import Lead
from .serializers import LeadSerializer, LeadDetailSerializer
from activities.models import LeadActivity
from activities.serializers import LeadActivitySerializer
from accounts.models import CustomUser
from accounts.permissions import get_user_org, IsManagerOrAbove

class LeadViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['source', 'status', 'interested_project', 'assigned_agent', 'priority']
    search_fields = ['full_name', 'phone', 'email', 'campaign', 'preferred_location']
    ordering_fields = ['created_at', 'full_name', 'min_budget', 'max_budget', 'next_followup_date', 'priority']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return LeadDetailSerializer
        return LeadSerializer

    def get_queryset(self):
        org = get_user_org(self.request)
        if not org:
            return Lead.objects.none()
        qs = Lead.objects.filter(organization=org).select_related(
            'interested_project', 'assigned_agent', 'organization'
        )

        # Enforce server-side role permissions
        user = self.request.user
        if user.is_manager_or_above:
            pass  # Owner and Manager see all leads
        elif user.role == 'TEAM_LEAD':
            # Team Lead sees their own leads + leads assigned to their team members
            team_ids = list(user.team_members.values_list('id', flat=True)) + [user.id]
            qs = qs.filter(assigned_agent_id__in=team_ids)
        else:
            # Executive sees only their assigned leads
            qs = qs.filter(assigned_agent=user)

        # Optional custom date range filtering
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        # Follow-up due filter
        followup_filter = self.request.query_params.get('followup_due')
        now = timezone.now()
        if followup_filter == 'today':
            qs = qs.filter(next_followup_date__date=now.date())
        elif followup_filter == 'overdue':
            qs = qs.filter(next_followup_date__lt=now)
        elif followup_filter == 'upcoming':
            qs = qs.filter(next_followup_date__gt=now)

        # Dashboard quick filters (unassigned, active, pending, dropped, not_interested)
        special_filter = self.request.query_params.get('filter')
        if special_filter == 'unassigned' or self.request.query_params.get('unassigned') == 'true':
            qs = qs.filter(assigned_agent__isnull=True)
        elif special_filter == 'active':
            qs = qs.exclude(status__in=['Booked', 'Lost'])
        elif special_filter == 'pending':
            qs = qs.filter(status__in=['Contacted', 'Interested'])
        elif special_filter == 'dropped':
            qs = qs.filter(status='Lost')
        elif special_filter == 'not_interested':
            qs = qs.filter(status='Lost')

        return qs

    def perform_create(self, serializer):
        org = get_user_org(self.request)
        # Check if executive is creating lead: default assigned_agent to self if not provided
        assigned_agent = serializer.validated_data.get('assigned_agent')
        if not assigned_agent and not self.request.user.is_manager_or_above:
            assigned_agent = self.request.user

        lead = serializer.save(organization=org, assigned_agent=assigned_agent)

        # Auto record activity
        LeadActivity.objects.create(
            organization=org,
            lead=lead,
            performed_by=self.request.user,
            activity_type='Lead Created',
            title='New Lead Created',
            description=f"Lead registered via {lead.source}. Initial status: {lead.status}."
        )

    def perform_update(self, serializer):
        old_lead = self.get_object()
        old_status = old_lead.status
        old_agent = old_lead.assigned_agent

        lead = serializer.save()

        # Log status change if modified
        if old_status != lead.status:
            LeadActivity.objects.create(
                organization=lead.organization,
                lead=lead,
                performed_by=self.request.user,
                activity_type='Status Changed',
                title=f"Status changed from {old_status} to {lead.status}",
                description=f"Updated by {self.request.user.display_name}. Reason: {lead.lost_reason or 'Pipeline progression'}."
            )

        # Log assignment change if modified
        if old_agent != lead.assigned_agent:
            new_agent_name = lead.assigned_agent.display_name if lead.assigned_agent else "Unassigned"
            LeadActivity.objects.create(
                organization=lead.organization,
                lead=lead,
                performed_by=self.request.user,
                activity_type='Assigned',
                title=f"Reassigned to {new_agent_name}",
                description=f"Assigned by {self.request.user.display_name}."
            )

    @action(detail=False, methods=['post'], url_path='check-duplicate')
    def check_duplicate(self, request):
        phone = request.data.get('phone', '').strip()
        org = get_user_org(request)
        if not phone or not org:
            return Response({'duplicate': False})

        existing = Lead.objects.filter(organization=org, phone=phone).first()
        if existing:
            return Response({
                'duplicate': True,
                'lead': {
                    'id': existing.id,
                    'full_name': existing.full_name,
                    'phone': existing.phone,
                    'status': existing.status,
                    'assigned_agent': existing.assigned_agent.display_name if existing.assigned_agent else None,
                    'created_at': existing.created_at,
                },
                'warning': f"A lead with phone '{phone}' already exists: {existing.full_name} ({existing.status})."
            })
        return Response({'duplicate': False})

    @action(detail=True, methods=['post'], url_path='assign')
    def assign_lead(self, request, pk=None):
        lead = self.get_object()
        agent_id = request.data.get('agent_id')

        if not request.user.is_manager_or_above and agent_id != request.user.id:
            is_team_member = False
            if request.user.role == 'TEAM_LEAD':
                is_team_member = request.user.team_members.filter(id=agent_id).exists()
            if not is_team_member:
                return Response(
                    {'error': 'Only managers, admins, and team leads can reassign leads.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        new_agent = None
        if agent_id:
            org = get_user_org(request)
            try:
                new_agent = CustomUser.objects.get(id=agent_id, organization=org)
            except CustomUser.DoesNotExist:
                return Response({'error': 'Selected team member does not exist in this organization.'}, status=status.HTTP_400_BAD_REQUEST)

        old_agent_name = lead.assigned_agent.display_name if lead.assigned_agent else "None"
        lead.assigned_agent = new_agent
        lead.save()

        new_agent_name = new_agent.display_name if new_agent else "Unassigned"
        LeadActivity.objects.create(
            organization=lead.organization,
            lead=lead,
            performed_by=request.user,
            activity_type='Assigned',
            title=f"Lead assigned to {new_agent_name}",
            description=f"Changed from {old_agent_name} to {new_agent_name} by {request.user.display_name}."
        )

        return Response({
            'message': f"Lead successfully assigned to {new_agent_name}.",
            'lead': LeadSerializer(lead).data
        })

    @action(detail=True, methods=['post'], url_path='change-status')
    def change_status(self, request, pk=None):
        lead = self.get_object()
        new_status = request.data.get('status')
        lost_reason = request.data.get('lost_reason', '')
        booked_amount = request.data.get('booked_amount')

        valid_statuses = [choice[0] for choice in Lead.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f"Invalid status '{new_status}'. Allowed: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_status == 'Lost' and not lost_reason:
            return Response(
                {'error': 'Please provide a lost reason when moving a lead to Lost.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = lead.status
        lead.status = new_status
        if new_status == 'Lost':
            lead.lost_reason = lost_reason
        elif new_status == 'Booked':
            lead.booked_date = timezone.now()
            if booked_amount:
                try:
                    lead.booked_amount = Decimal(str(booked_amount))
                except Exception:
                    pass
        lead.save()

        LeadActivity.objects.create(
            organization=lead.organization,
            lead=lead,
            performed_by=request.user,
            activity_type='Stage Moved',
            title=f"Pipeline stage moved: {old_status} → {new_status}",
            description=f"Moved by {request.user.display_name}. " + (f"Lost reason: {lost_reason}" if lost_reason else "")
        )

        return Response({
            'message': f"Status changed to {new_status}.",
            'lead': LeadSerializer(lead).data
        })

    @action(detail=True, methods=['get'], url_path='activities')
    def get_activities(self, request, pk=None):
        lead = self.get_object()
        activities = lead.activities.all()
        return Response(LeadActivitySerializer(activities, many=True).data)

    @action(detail=True, methods=['post'], url_path='add-note')
    def add_note(self, request, pk=None):
        lead = self.get_object()
        note_text = request.data.get('note', '').strip()
        if not note_text:
            return Response({'error': 'Note text cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        LeadActivity.objects.create(
            organization=lead.organization,
            lead=lead,
            performed_by=request.user,
            activity_type='Note Added',
            title='Note added by ' + request.user.display_name,
            description=note_text
        )
        return Response({'message': 'Note added successfully.'})
