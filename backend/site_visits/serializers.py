from rest_framework import serializers
from .models import SiteVisit

class SiteVisitSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source='lead.full_name', read_only=True)
    lead_phone = serializers.CharField(source='lead.phone', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    project_location = serializers.CharField(source='project.location', read_only=True)
    assigned_executive_name = serializers.CharField(source='assigned_executive.display_name', read_only=True)
    assigned_executive_avatar = serializers.CharField(source='assigned_executive.avatar_url', read_only=True)

    class Meta:
        model = SiteVisit
        fields = [
            'id', 'lead', 'lead_name', 'lead_phone',
            'project', 'project_name', 'project_location',
            'assigned_executive', 'assigned_executive_name', 'assigned_executive_avatar',
            'scheduled_datetime', 'status', 'outcome', 'notes',
            'completed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'completed_at', 'created_at', 'updated_at']
