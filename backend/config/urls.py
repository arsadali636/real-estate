from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.views import LoginView, LogoutView, CurrentUserView, SwitchDemoRoleView, TeamMemberViewSet
from projects.views import ProjectViewSet, PropertyUnitViewSet
from leads.views import LeadViewSet
from activities.views import LeadActivityViewSet
from tasks.views import FollowUpTaskViewSet
from site_visits.views import SiteVisitViewSet
from reports.views import (
    DashboardSummaryView, ReportsView, ExportCSVView,
    LeadSourcesView, LeadFunnelView, ActivitySummaryView,
    AgentPerformanceView, RemindersView,
    UserActivityReportView, ExportUserActivityCSVView
)

class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({
            'status': 'healthy',
            'product': 'ESTATEVO CRM API',
            'version': '1.0.0',
            'database': 'PostgreSQL'
        })

router = DefaultRouter()
router.register(r'leads', LeadViewSet, basename='leads')
router.register(r'tasks', FollowUpTaskViewSet, basename='tasks')
router.register(r'projects', ProjectViewSet, basename='projects')
router.register(r'properties', PropertyUnitViewSet, basename='properties')
router.register(r'site-visits', SiteVisitViewSet, basename='site-visits')
router.register(r'activities', LeadActivityViewSet, basename='activities')
router.register(r'team/members', TeamMemberViewSet, basename='team-members')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', HealthCheckView.as_view(), name='health-check'),
    
    # Auth endpoints
    path('api/v1/auth/login/', LoginView.as_view(), name='auth-login'),
    path('api/v1/auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('api/v1/auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('api/v1/auth/switch-demo-role/', SwitchDemoRoleView.as_view(), name='auth-switch-role'),
    
    # Dashboard & Reports
    path('api/v1/dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('api/v1/dashboard/lead-sources/', LeadSourcesView.as_view(), name='dashboard-lead-sources'),
    path('api/v1/dashboard/lead-funnel/', LeadFunnelView.as_view(), name='dashboard-lead-funnel'),
    path('api/v1/dashboard/activity-summary/', ActivitySummaryView.as_view(), name='dashboard-activity-summary'),
    path('api/v1/dashboard/agent-performance/', AgentPerformanceView.as_view(), name='dashboard-agent-performance'),
    path('api/v1/dashboard/reminders/', RemindersView.as_view(), name='dashboard-reminders'),
    path('api/v1/reports/user-activity/', UserActivityReportView.as_view(), name='reports-user-activity'),
    path('api/v1/reports/export/user-activity/', ExportUserActivityCSVView.as_view(), name='reports-export-user-activity'),
    path('api/v1/reports/<str:report_type>/', ReportsView.as_view(), name='reports-detail'),
    path('api/v1/reports/export/csv/', ExportCSVView.as_view(), name='reports-export-csv'),
    
    # Router endpoints (leads, tasks, projects, properties, site-visits, activities, team)
    path('api/v1/', include(router.urls)),
]
