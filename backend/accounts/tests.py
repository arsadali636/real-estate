from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import CustomUser
from organizations.models import Organization

class AuthAndAccountsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(name="Test Realty Org", slug="test-realty-org")
        self.admin = CustomUser.objects.create_user(
            username="testadmin",
            email="admin@test.com",
            password="TestPassword@123",
            role="OWNER",
            organization=self.org
        )
        self.exec_user = CustomUser.objects.create_user(
            username="testexec",
            email="exec@test.com",
            password="TestPassword@123",
            role="EXECUTIVE",
            organization=self.org
        )

    def test_login_success(self):
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'admin@test.com',
            'password': 'TestPassword@123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['role'], 'OWNER')

    def test_auth_me_authenticated(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], 'testadmin')

    def test_switch_demo_role(self):
        response = self.client.post('/api/v1/auth/switch-demo-role/', {'role': 'EXECUTIVE'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_team_members_list(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/v1/team/members/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data.get('results', response.data)), 2)
