from rest_framework import serializers
from .models import LeadActivity

class LeadActivitySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.display_name', read_only=True)
    performed_by_avatar = serializers.CharField(source='performed_by.avatar_url', read_only=True)
    lead_name = serializers.CharField(source='lead.full_name', read_only=True)

    class Meta:
        model = LeadActivity
        fields = [
            'id', 'lead', 'lead_name', 'performed_by',
            'performed_by_name', 'performed_by_avatar',
            'activity_type', 'title', 'description', 'metadata',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
