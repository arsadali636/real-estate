from rest_framework import serializers
from .models import Project, PropertyUnit

class PropertyUnitSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = PropertyUnit
        fields = [
            'id', 'project', 'project_name', 'unit_number',
            'tower', 'floor', 'unit_type', 'area_sqft',
            'price', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProjectSerializer(serializers.ModelSerializer):
    available_units_count = serializers.IntegerField(read_only=True)
    reserved_units_count = serializers.IntegerField(read_only=True)
    sold_units_count = serializers.IntegerField(read_only=True)
    leads_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'slug', 'developer_name', 'location',
            'city', 'property_type', 'price_min', 'price_max',
            'total_units', 'available_units_count', 'reserved_units_count',
            'sold_units_count', 'leads_count', 'status', 'description',
            'amenities', 'image_url', 'gallery', 'brochure_url',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_leads_count(self, obj):
        return obj.leads.count()

class ProjectDetailSerializer(ProjectSerializer):
    units = PropertyUnitSerializer(many=True, read_only=True)

    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['units']
