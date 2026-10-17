from rest_framework import serializers
from .models import FollowUpTask

class FollowUpTaskSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source='lead.full_name', read_only=True)
    lead_phone = serializers.CharField(source='lead.phone', read_only=True)
    lead_project_name = serializers.CharField(source='lead.interested_project.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.display_name', read_only=True)
    assigned_to_avatar = serializers.CharField(source='assigned_to.avatar_url', read_only=True)

    class Meta:
        model = FollowUpTask
        fields = [
            'id', 'lead', 'lead_name', 'lead_phone', 'lead_project_name',
            'assigned_to', 'assigned_to_name', 'assigned_to_avatar',
            'created_by', 'task_type', 'priority', 'due_datetime',
            'status', 'notes', 'outcome', 'completed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'completed_at', 'created_at', 'updated_at']
