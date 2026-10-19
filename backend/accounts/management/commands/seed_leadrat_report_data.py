import random
from datetime import datetime, timedelta, time
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from rest_framework.authtoken.models import Token

from accounts.models import CustomUser
from organizations.models import Organization, OrganizationMembership
from projects.models import Project
from leads.models import Lead
from activities.models import LeadActivity
from tasks.models import FollowUpTask
from site_visits.models import SiteVisit


class Command(BaseCommand):
    help = "Seeds Leadrat CRM report data including 20+ team members, realistic activity tracking, sources and pipeline metrics."

    def handle(self, *args, **options):
        self.stdout.write("Seeding Leadrat CRM reporting data...")

        org = Organization.objects.first()
        if not org:
            org = Organization.objects.create(
                slug="easy-gharoffice",
                name="Easy GharOffice Solutions Pvt. Ltd.",
                phone="+91 80 4920 1800",
                email="contact@easygharoffice.com",
                currency_symbol="₹"
            )

        # Update org name to match Image 1 if desired:
        if org.name != "Easy GharOffice Solutions Pvt. Ltd.":
            org.name = "Easy GharOffice Solutions Pvt. Ltd."
            org.save()

        # Representative team members from Leadrat CRM screenshots
        team_members_spec = [
            {"username": "aditya.surana", "first_name": "Aditya", "last_name": "Surana", "role": "EXECUTIVE", "hours": "07:42:15", "calls": 52, "unique_calls": 48, "status_edits": 35, "unique_status": 32, "form_edits": 2, "unique_forms": 2, "notes": 37, "unique_notes": 33, "callback": 25, "dropped": 2},
            {"username": "ajit.lotake", "first_name": "Ajit", "last_name": "Lotake", "role": "EXECUTIVE", "hours": "06:15:30", "calls": 48, "unique_calls": 45, "status_edits": 1, "unique_status": 1, "notes": 2, "unique_notes": 2, "callback": 1},
            {"username": "ayesha.begum", "first_name": "Ayesha", "last_name": "Begum", "role": "EXECUTIVE", "hours": "08:10:00", "calls": 3, "unique_calls": 3, "status_edits": 19, "unique_status": 14, "form_edits": 10, "unique_forms": 8, "notes": 13, "unique_notes": 10, "meetings": 5, "meetings_done": 3, "callback": 13},
            {"username": "basabjit.saha", "first_name": "Basabjit", "last_name": "Saha", "role": "EXECUTIVE", "hours": "00:00:20", "calls": 2, "unique_calls": 2, "whatsapp": 2, "unique_whatsapp": 2},
            {"username": "abhishek.das", "first_name": "Abhishek", "last_name": "Das", "role": "EXECUTIVE", "hours": "--"},
            {"username": "abhishek.lahiri", "first_name": "Abhishek", "last_name": "Lahiri", "role": "EXECUTIVE", "hours": "--"},
            {"username": "adarsh.t", "first_name": "Adarsh", "last_name": "T", "role": "EXECUTIVE", "hours": "--"},
            {"username": "ajit.gaur", "first_name": "Ajit", "last_name": "Gaur", "role": "EXECUTIVE", "hours": "--"},
            {"username": "akash.barbuddhe", "first_name": "Akash", "last_name": "Barbuddhe", "role": "EXECUTIVE", "hours": "--"},
            {"username": "akhilesh.gurjar", "first_name": "Akhilesh", "last_name": "Gurjar", "role": "EXECUTIVE", "hours": "--"},
            {"username": "ayush.mishra", "first_name": "Ayush", "last_name": "Mishra", "role": "EXECUTIVE", "hours": "--"},
            {"username": "basasa.ghghj", "first_name": "basasa", "last_name": "ghghj", "role": "EXECUTIVE", "hours": "--"},
            {"username": "bhupendra.singh", "first_name": "Bhupendra", "last_name": "singh", "role": "EXECUTIVE", "hours": "--"},
            {"username": "black.admin", "first_name": "black", "last_name": "Admin", "role": "ADMIN", "hours": "--"},
            {"username": "manasa.pampana", "first_name": "Manasa", "last_name": "Pampana", "role": "EXECUTIVE", "hours": "05:22:40", "calls": 14, "unique_calls": 12, "whatsapp": 18, "unique_whatsapp": 16, "status_edits": 8, "unique_status": 7, "notes": 11, "unique_notes": 10, "meetings": 4, "meetings_done": 2, "site_visits": 3, "site_visits_done": 2, "booked": 1},
            {"username": "varun.agent", "first_name": "Varun", "last_name": "Kapoor", "role": "EXECUTIVE", "hours": "07:50:12", "calls": 28, "unique_calls": 24, "whatsapp": 15, "unique_whatsapp": 14, "status_edits": 12, "unique_status": 10, "notes": 15, "unique_notes": 13, "site_visits": 4, "site_visits_done": 3, "booked": 2},
            {"username": "sarah.agent", "first_name": "Sarah", "last_name": "Jenkins", "role": "EXECUTIVE", "hours": "08:05:44", "calls": 32, "unique_calls": 28, "whatsapp": 20, "unique_whatsapp": 18, "status_edits": 16, "unique_status": 14, "notes": 22, "unique_notes": 19, "meetings": 3, "meetings_done": 3, "site_visits": 5, "site_visits_done": 4, "booked": 3},
            {"username": "vikram.agent", "first_name": "Vikram", "last_name": "Malhotra", "role": "EXECUTIVE", "hours": "06:40:00", "calls": 22, "unique_calls": 19, "whatsapp": 10, "unique_whatsapp": 9, "status_edits": 9, "unique_status": 8, "notes": 14, "unique_notes": 12, "site_visits": 3, "site_visits_done": 2, "booked": 1},
            {"username": "priya.agent", "first_name": "Priya", "last_name": "Patel", "role": "EXECUTIVE", "hours": "07:15:20", "calls": 26, "unique_calls": 23, "whatsapp": 14, "unique_whatsapp": 12, "status_edits": 11, "unique_status": 10, "notes": 18, "unique_notes": 15, "site_visits": 2, "site_visits_done": 2, "booked": 1},
            {"username": "sneha.agent", "first_name": "Sneha", "last_name": "Nowlak", "role": "EXECUTIVE", "hours": "06:55:10", "calls": 19, "unique_calls": 17, "whatsapp": 12, "unique_whatsapp": 11, "status_edits": 7, "unique_status": 6, "notes": 9, "unique_notes": 8, "meetings": 2, "meetings_done": 1, "booked": 1},
            {"username": "amitav.agent", "first_name": "Amitav", "last_name": "Sen", "role": "EXECUTIVE", "hours": "07:30:00", "calls": 25, "unique_calls": 21, "whatsapp": 16, "unique_whatsapp": 15, "status_edits": 14, "unique_status": 12, "notes": 17, "unique_notes": 14, "site_visits": 4, "site_visits_done": 3, "booked": 1},
        ]

        now = timezone.now()
        leads = list(Lead.objects.filter(organization=org))
        if not leads:
            self.stdout.write("Creating initial leads pool...")
            for i in range(100):
                lead = Lead.objects.create(
                    organization=org,
                    full_name=f"Lead Prospect {i+1}",
                    phone=f"+91 98765 {10000+i}",
                    email=f"prospect{i+1}@example.com",
                    source=random.choice(["Housing", "Magicbricks", "Facebook", "Google Ads", "Website", "Direct/Walkin", "99acres", "QuikrHomes"]),
                    status=random.choice(["New", "Contacted", "Interested", "Site Visit Scheduled", "Site Visit Done", "Booked", "Lost"]),
                    min_budget=Decimal("5000000"),
                    max_budget=Decimal("15000000")
                )
                leads.append(lead)

        created_users_map = {}
        for spec in team_members_spec:
            user, u_created = CustomUser.objects.get_or_create(
                username=spec["username"],
                defaults={
                    "email": f"{spec['username']}@easygharoffice.com",
                    "first_name": spec["first_name"],
                    "last_name": spec["last_name"],
                    "role": spec["role"],
                    "organization": org,
                }
            )
            user.set_password("EstateFlow@2026")
            user.first_name = spec["first_name"]
            user.last_name = spec["last_name"]
            user.role = spec["role"]
            user.organization = org
            user.save()
            Token.objects.get_or_create(user=user)
            OrganizationMembership.objects.get_or_create(organization=org, user=user, defaults={"role": spec["role"]})
            created_users_map[spec["username"]] = user

            # Create realistic LeadActivities matching specs if calls/whatsapp/edits are specified
            calls_target = spec.get("calls", 0)
            if calls_target > 0:
                current_calls = LeadActivity.objects.filter(organization=org, performed_by=user, activity_type="Call").count()
                to_add = max(0, calls_target - current_calls)
                for c in range(to_add):
                    l = random.choice(leads)
                    LeadActivity.objects.create(
                        organization=org,
                        lead=l,
                        performed_by=user,
                        activity_type="Call",
                        title=f"Outbound Phone Call with {l.full_name}",
                        description="Discussed budget, configuration requirements, and scheduled site tour.",
                        created_at=now - timedelta(hours=random.randint(1, 10))
                    )

            wa_target = spec.get("whatsapp", 0)
            if wa_target > 0:
                current_wa = LeadActivity.objects.filter(organization=org, performed_by=user, activity_type="WhatsApp").count()
                to_add = max(0, wa_target - current_wa)
                for w in range(to_add):
                    l = random.choice(leads)
                    LeadActivity.objects.create(
                        organization=org,
                        lead=l,
                        performed_by=user,
                        activity_type="WhatsApp",
                        title=f"WhatsApp brochure shared with {l.full_name}",
                        description="Sent project brochure and video walkthrough.",
                        created_at=now - timedelta(hours=random.randint(1, 8))
                    )

            status_target = spec.get("status_edits", 0)
            if status_target > 0:
                current_st = LeadActivity.objects.filter(organization=org, performed_by=user, activity_type="Status Changed").count()
                to_add = max(0, status_target - current_st)
                for s in range(to_add):
                    l = random.choice(leads)
                    LeadActivity.objects.create(
                        organization=org,
                        lead=l,
                        performed_by=user,
                        activity_type="Status Changed",
                        title=f"Lead stage updated for {l.full_name}",
                        description="Updated prospect workflow stage.",
                        created_at=now - timedelta(hours=random.randint(1, 12))
                    )

            notes_target = spec.get("notes", 0)
            if notes_target > 0:
                current_notes = LeadActivity.objects.filter(organization=org, performed_by=user, activity_type="Note Added").count()
                to_add = max(0, notes_target - current_notes)
                for n in range(to_add):
                    l = random.choice(leads)
                    LeadActivity.objects.create(
                        organization=org,
                        lead=l,
                        performed_by=user,
                        activity_type="Note Added",
                        title=f"Client notes recorded for {l.full_name}",
                        description="Looking for 3 BHK high floor unit.",
                        created_at=now - timedelta(hours=random.randint(1, 10))
                    )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded Leadrat CRM user activity & reporting data for {len(team_members_spec)} users."))
