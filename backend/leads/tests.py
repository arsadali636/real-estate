from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import CustomUser
from organizations.models import Organization
from projects.models import Project
from leads.models import Lead

class LeadManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(name="Apex Demo Org", slug="apex-demo-org")
        self.admin = CustomUser.objects.create_user(
            username="orgadmin",
            email="orgadmin@demo.com",
            password="DemoPassword@123",
            role="ADMIN",
            organization=self.org
        )
        self.agent1 = CustomUser.objects.create_user(
            username="agent1",
            email="agent1@demo.com",
            password="DemoPassword@123",
            role="EXECUTIVE",
            organization=self.org
        )
        self.agent2 = CustomUser.objects.create_user(
            username="agent2",
            email="agent2@demo.com",
            password="DemoPassword@123",
            role="EXECUTIVE",
            organization=self.org
        )
        self.project = Project.objects.create(
            organization=self.org,
            name="Azure Horizon Heights",
            developer_name="Apex Builders",
            location="Whitefield",
            price_min=Decimal("10000000"),
            price_max=Decimal("20000000")
        )
        self.lead1 = Lead.objects.create(
            organization=self.org,
            full_name="Rajesh Nambiar",
            phone="+91 99000 11223",
            email="rajesh.n@test.com",
            status="New",
            source="Website",
            assigned_agent=self.agent1,
            interested_project=self.project
        )

    def test_lead_list_for_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/v1/leads/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 1)

    def test_lead_scoping_for_executive(self):
        # agent2 has no assigned leads yet
        self.client.force_authenticate(user=self.agent2)
        response = self.client.get('/api/v1/leads/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 0)

        # agent1 has 1 assigned lead
        self.client.force_authenticate(user=self.agent1)
        response = self.client.get('/api/v1/leads/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)

    def test_duplicate_phone_check(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/v1/leads/check-duplicate/', {
            'phone': '+91 99000 11223'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['duplicate'])

    def test_change_status_requires_lost_reason_when_lost(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(f'/api/v1/leads/{self.lead1.id}/change-status/', {
            'status': 'Lost'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # With reason
        response = self.client.post(f'/api/v1/leads/{self.lead1.id}/change-status/', {
            'status': 'Lost',
            'lost_reason': 'Purchased elsewhere'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.lead1.refresh_from_db()
        self.assertEqual(self.lead1.status, 'Lost')
        self.assertEqual(self.lead1.lost_reason, 'Purchased elsewhere')
