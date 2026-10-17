from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project, PropertyUnit
from .serializers import ProjectSerializer, ProjectDetailSerializer, PropertyUnitSerializer
from accounts.permissions import get_user_org, IsOwnerOrAdmin

class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['property_type', 'status', 'city', 'is_active']
    search_fields = ['name', 'developer_name', 'location', 'city']
    ordering_fields = ['name', 'price_min', 'created_at', 'total_units']
    ordering = ['-created_at']

    def get_queryset(self):
        org = get_user_org(self.request)
        if not org:
            return Project.objects.none()
        return Project.objects.filter(organization=org).prefetch_related('units', 'leads')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        org = get_user_org(self.request)
        serializer.save(organization=org)

class PropertyUnitViewSet(viewsets.ModelViewSet):
    serializer_class = PropertyUnitSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project', 'status', 'tower', 'floor', 'unit_type']
    search_fields = ['unit_number', 'tower', 'project__name']
    ordering_fields = ['price', 'area_sqft', 'floor', 'unit_number']
    ordering = ['project', 'tower', 'unit_number']

    def get_queryset(self):
        org = get_user_org(self.request)
        if not org:
            return PropertyUnit.objects.none()
        return PropertyUnit.objects.filter(organization=org).select_related('project')

    def perform_create(self, serializer):
        org = get_user_org(self.request)
        serializer.save(organization=org)
