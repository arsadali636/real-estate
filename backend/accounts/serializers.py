from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser
from organizations.models import Organization

class OrganizationSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'currency_symbol', 'phone', 'email']

class UserSerializer(serializers.ModelSerializer):
    organization = OrganizationSimpleSerializer(read_only=True)
    display_name = serializers.CharField(read_only=True)
    is_owner_or_admin = serializers.BooleanField(read_only=True)
    is_manager_or_above = serializers.BooleanField(read_only=True)
    is_team_lead_or_above = serializers.BooleanField(read_only=True)
    team_lead_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'display_name', 'role', 'job_title', 'phone',
            'avatar_url', 'organization', 'is_active',
            'is_owner_or_admin', 'is_manager_or_above', 'is_team_lead_or_above',
            'team_lead', 'team_lead_name',
        ]
        read_only_fields = ['id', 'username']

    def get_team_lead_name(self, obj):
        return obj.team_lead.display_name if obj.team_lead else None

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        # Check if username is an email
        if '@' in username:
            try:
                user_obj = CustomUser.objects.get(email__iexact=username)
                username = user_obj.username
            except CustomUser.DoesNotExist:
                pass

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials. Please verify your email/username and password.")
        if not user.is_active:
            raise serializers.ValidationError("This user account is inactive.")
        data['user'] = user
        return data

class TeamMemberSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)
    assigned_leads_count = serializers.SerializerMethodField()
    completed_tasks_count = serializers.SerializerMethodField()
    completed_visits_count = serializers.SerializerMethodField()
    booked_leads_count = serializers.SerializerMethodField()
    conversion_rate = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'display_name', 'role', 'job_title', 'phone',
            'avatar_url', 'is_active', 'date_joined',
            'assigned_leads_count', 'completed_tasks_count',
            'completed_visits_count', 'booked_leads_count', 'conversion_rate',
        ]

    def get_assigned_leads_count(self, obj):
        return obj.assigned_leads.filter(organization=obj.organization).count()

    def get_completed_tasks_count(self, obj):
        return obj.assigned_tasks.filter(organization=obj.organization, status='Completed').count()

    def get_completed_visits_count(self, obj):
        return obj.assigned_site_visits.filter(organization=obj.organization, status='Completed').count()

    def get_booked_leads_count(self, obj):
        return obj.assigned_leads.filter(organization=obj.organization, status='Booked').count()

    def get_conversion_rate(self, obj):
        total = self.get_assigned_leads_count(obj)
        booked = self.get_booked_leads_count(obj)
        if total == 0:
            return 0.0
        return round((booked / total) * 100, 1)
