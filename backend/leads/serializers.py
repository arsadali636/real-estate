from rest_framework import serializers
from .models import Lead
from projects.serializers import ProjectSerializer
from accounts.serializers import UserSerializer

class LeadSerializer(serializers.ModelSerializer):
    interested_project_name = serializers.CharField(source='interested_project.name', read_only=True)
    assigned_agent_name = serializers.CharField(source='assigned_agent.display_name', read_only=True)
    assigned_agent_avatar = serializers.CharField(source='assigned_agent.avatar_url', read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'full_name', 'phone', 'email', 'source', 'campaign',
            'interested_project', 'interested_project_name',
            'min_budget', 'max_budget', 'preferred_location',
            'priority', 'status',
            'assigned_agent', 'assigned_agent_name', 'assigned_agent_avatar',
            'next_followup_date', 'notes', 'lost_reason',
            'booked_date', 'booked_amount',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_phone(self, value):
        if not value or len(value.strip()) < 7:
            raise serializers.ValidationError("Please provide a valid phone number with at least 7 digits.")
        return value.strip()

    def validate(self, data):
        status = data.get('status')
        lost_reason = data.get('lost_reason')
        if status == 'Lost' and not lost_reason:
            # If transitioning to Lost, a reason is required
            if not self.instance or self.instance.status != 'Lost':
                raise serializers.ValidationError({"lost_reason": "A lost reason is required when moving a lead to Lost."})
        return data

class LeadDetailSerializer(LeadSerializer):
    activities = serializers.SerializerMethodField()
    tasks = serializers.SerializerMethodField()
    site_visits = serializers.SerializerMethodField()

    class Meta(LeadSerializer.Meta):
        fields = LeadSerializer.Meta.fields + ['activities', 'tasks', 'site_visits']

    def get_activities(self, obj):
        from activities.serializers import LeadActivitySerializer
        activities = obj.activities.all()[:20]
        return LeadActivitySerializer(activities, many=True).data

    def get_tasks(self, obj):
        from tasks.serializers import FollowUpTaskSerializer
        tasks = obj.tasks.all()[:15]
        return FollowUpTaskSerializer(tasks, many=True).data

    def get_site_visits(self, obj):
        from site_visits.serializers import SiteVisitSerializer
        visits = obj.site_visits.all()[:10]
        return SiteVisitSerializer(visits, many=True).data
