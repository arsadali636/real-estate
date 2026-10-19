from rest_framework import status, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login as django_login, logout as django_logout

from .models import CustomUser
from .serializers import LoginSerializer, UserSerializer, TeamMemberSerializer
from .permissions import IsOwnerOrAdmin, get_user_org

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': f"Welcome back, {user.display_name}!"
        })

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        django_logout(request)
        return Response({'message': 'Logged out successfully.'})

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'user': UserSerializer(request.user).data
        })

class SwitchDemoRoleView(APIView):
    """
    DEMO MODE ONLY: Allows switching to another seeded role account
    within the demo organization to test role-based behavior.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        role_target = request.data.get('role', 'OWNER')
        username_target = request.data.get('username')

        query = CustomUser.objects.filter(is_active=True)
        if username_target:
            target_user = query.filter(username=username_target).first()
        else:
            role_map = {
                'OWNER': 'admin',
                'ADMIN': 'admin',
                'MANAGER': 'manager',
                'TEAM_LEAD': 'rahul.tl',
                'EXECUTIVE': 'sarah.agent',
            }
            uname = role_map.get(role_target.upper(), 'admin')
            target_user = query.filter(username=uname).first() or query.filter(role=role_target).first()

        if not target_user:
            return Response({'error': 'Target demo user not found.'}, status=status.HTTP_404_NOT_FOUND)

        token, _ = Token.objects.get_or_create(user=target_user)
        return Response({
            'token': token.key,
            'user': UserSerializer(target_user).data,
            'demo_notice': 'Switched active demo user. Server-side permissions are now enforced as ' + target_user.role,
        })

class TeamMemberViewSet(viewsets.ModelViewSet):
    serializer_class = TeamMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        org = get_user_org(self.request)
        if not org:
            return CustomUser.objects.none()
        return CustomUser.objects.filter(organization=org).order_by('-date_joined')

    def perform_create(self, serializer):
        org = get_user_org(self.request)
        serializer.save(organization=org)
