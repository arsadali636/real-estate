import random
from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from rest_framework.authtoken.models import Token

from accounts.models import CustomUser
from organizations.models import Organization, OrganizationMembership
from projects.models import Project, PropertyUnit
from leads.models import Lead
from activities.models import LeadActivity
from tasks.models import FollowUpTask
from site_visits.models import SiteVisit


class Command(BaseCommand):
    help = "Seeds repeatable, realistic demo data for ESTATEVO CRM without duplicating existing records."

    def handle(self, *args, **options):
        self.stdout.write("Starting ESTATEVO CRM demo data seeding...")

        # 1. Demo Organization
        org, created = Organization.objects.get_or_create(
            slug="apex-horizon-realty",
            defaults={
                "name": "Apex Horizon Realty Partners",
                "phone": "+91 80 4920 1800",
                "email": "contact@apexhorizonrealty.com",
                "address": "Level 14, Prestige Nebula, Outer Ring Road, Bengaluru, Karnataka 560103",
                "website": "https://apexhorizonrealty.com",
                "currency_symbol": "₹",
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created organization: {org.name}"))
        else:
            self.stdout.write(f"Organization '{org.name}' already exists.")

        # 2. Seeded Users (Owner, Manager, 6 Sales Executives)
        users_data = [
            {
                "username": "admin",
                "email": "admin@estatevo.io",
                "first_name": "Rajesh",
                "last_name": "Sharma",
                "role": "OWNER",
                "job_title": "Managing Director & Founder",
                "phone": "+91 98450 11223",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            },
            {
                "username": "manager",
                "email": "manager@estatevo.io",
                "first_name": "Ananya",
                "last_name": "Verma",
                "role": "MANAGER",
                "job_title": "VP of Residential Sales",
                "phone": "+91 98450 22334",
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            },
            {
                "username": "rahul.tl",
                "email": "rahul.tl@estatevo.io",
                "first_name": "Rahul",
                "last_name": "Saxena",
                "role": "TEAM_LEAD",
                "job_title": "Residential Team Lead (East Bengaluru)",
                "phone": "+91 98450 88221",
                "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
            },
            {
                "username": "sarah.agent",
                "email": "sarah.agent@estatevo.io",
                "first_name": "Sarah",
                "last_name": "Jenkins",
                "role": "EXECUTIVE",
                "job_title": "Senior Relationship Manager",
                "phone": "+91 98450 33445",
                "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
            },
            {
                "username": "vikram.agent",
                "email": "vikram.agent@estatevo.io",
                "first_name": "Vikram",
                "last_name": "Malhotra",
                "role": "EXECUTIVE",
                "job_title": "Luxury Portfolio Consultant",
                "phone": "+91 98450 44556",
                "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            },
            {
                "username": "priya.agent",
                "email": "priya.agent@estatevo.io",
                "first_name": "Priya",
                "last_name": "Patel",
                "role": "EXECUTIVE",
                "job_title": "Commercial & Residential Advisor",
                "phone": "+91 98450 55667",
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            },
            {
                "username": "varun.agent",
                "email": "varun.agent@estatevo.io",
                "first_name": "Varun",
                "last_name": "Kapoor",
                "role": "EXECUTIVE",
                "job_title": "Senior Sales Specialist",
                "phone": "+91 98450 66778",
                "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
            },
            {
                "username": "sneha.agent",
                "email": "sneha.agent@estatevo.io",
                "first_name": "Sneha",
                "last_name": "Nowlak",
                "role": "EXECUTIVE",
                "job_title": "HNI Client Advisor",
                "phone": "+91 98450 77889",
                "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
            },
            {
                "username": "amitav.agent",
                "email": "amitav.agent@estatevo.io",
                "first_name": "Amitav",
                "last_name": "Sen",
                "role": "EXECUTIVE",
                "job_title": "Senior Project Specialist",
                "phone": "+91 98450 88990",
                "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
            },
        ]

        created_users = {}
        for u_data in users_data:
            user, u_created = CustomUser.objects.get_or_create(
                username=u_data["username"],
                defaults={
                    "email": u_data["email"],
                    "first_name": u_data["first_name"],
                    "last_name": u_data["last_name"],
                    "role": u_data["role"],
                    "job_title": u_data["job_title"],
                    "phone": u_data["phone"],
                    "avatar_url": u_data["avatar_url"],
                    "organization": org,
                }
            )
            user.set_password("EstateFlow@2026")
            user.email = u_data["email"]
            user.organization = org
            user.role = u_data["role"]
            user.job_title = u_data["job_title"]
            user.avatar_url = u_data["avatar_url"]
            user.save()

            Token.objects.get_or_create(user=user)
            OrganizationMembership.objects.get_or_create(
                organization=org,
                user=user,
                defaults={"role": u_data["role"]}
            )

            created_users[user.username] = user
            if u_created:
                self.stdout.write(self.style.SUCCESS(f"Created user: {user.username} ({user.role})"))

        # Link team members to Team Lead (Rahul Saxena)
        rahul = created_users.get("rahul.tl")
        if rahul:
            for agent_key in ["sarah.agent", "priya.agent"]:
                if agent_key in created_users:
                    agent = created_users[agent_key]
                    agent.team_lead = rahul
                    agent.save(update_fields=["team_lead"])

        executives = [
            created_users["rahul.tl"],
            created_users["sarah.agent"],
            created_users["vikram.agent"],
            created_users["priya.agent"],
            created_users["varun.agent"],
            created_users["sneha.agent"],
            created_users["amitav.agent"],
        ]

        # 3. Demo Projects (6 distinct projects across segments)
        projects_data = [
            {
                "name": "Skyline Pinnacle Residences",
                "developer_name": "Sobha Prestige Group",
                "location": "Indiranagar, 100ft Road",
                "city": "Bengaluru",
                "property_type": "Apartment",
                "price_min": Decimal("18000000"),
                "price_max": Decimal("34000000"),
                "total_units": 48,
                "status": "Under Construction",
                "description": "Ultra-luxury high-rise residences with panoramic city views, infinity sky pool, and private smart elevators in the heart of Indiranagar.",
                "amenities": ["Sky Lounge", "Heated Swimming Pool", "Smart Home Automation", "Private Elevators", "Squash Court", "EV Charging Bays", "Concierge Service"],
                "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80",
                "brochure_url": "https://example.com/brochures/skyline-pinnacle.pdf",
                "units": [
                    {"tower": "Tower A", "floor": 4, "unit_number": "A-401", "unit_type": "3 BHK", "area": 2150, "price": Decimal("21500000"), "status": "Available"},
                    {"tower": "Tower A", "floor": 6, "unit_number": "A-602", "unit_type": "3 BHK", "area": 2200, "price": Decimal("22000000"), "status": "Reserved"},
                    {"tower": "Tower A", "floor": 10, "unit_number": "A-1001", "unit_type": "4 BHK Penthouse", "area": 3400, "price": Decimal("34000000"), "status": "Sold"},
                    {"tower": "Tower B", "floor": 2, "unit_number": "B-201", "unit_type": "2.5 BHK", "area": 1780, "price": Decimal("18500000"), "status": "Available"},
                    {"tower": "Tower B", "floor": 5, "unit_number": "B-503", "unit_type": "3 BHK", "area": 2180, "price": Decimal("22500000"), "status": "Available"},
                    {"tower": "Tower B", "floor": 8, "unit_number": "B-802", "unit_type": "4 BHK Penthouse", "area": 3350, "price": Decimal("33500000"), "status": "Reserved"},
                ]
            },
            {
                "name": "Azure Palms Ultra-Luxury Villas",
                "developer_name": "Embassy Boulevard Creators",
                "location": "North Bengaluru, Near Airport Road",
                "city": "Bengaluru",
                "property_type": "Villa",
                "price_min": Decimal("45000000"),
                "price_max": Decimal("82000000"),
                "total_units": 24,
                "status": "Ready to Move",
                "description": "Gated enclave of bespoke private villas featuring European architecture, personal plunge pools, landscaped Zen courtyards, and concierge assistance.",
                "amenities": ["Private Plunge Pool", "Italian Marble Flooring", "Lush Landscaped Courtyard", "Solar Powered Grid", "Clubhouse & Spa", "Golf Simulator", "24/7 Biometric Guarding"],
                "image_url": "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1000&auto=format&fit=crop&q=80",
                "brochure_url": "https://example.com/brochures/azure-palms.pdf",
                "units": [
                    {"tower": "Villa Enclave 1", "floor": 1, "unit_number": "Villa 04", "unit_type": "4 BHK Grand Villa", "area": 4600, "price": Decimal("49500000"), "status": "Available"},
                    {"tower": "Villa Enclave 1", "floor": 1, "unit_number": "Villa 07", "unit_type": "5 BHK Signature Villa", "area": 6200, "price": Decimal("68000000"), "status": "Reserved"},
                    {"tower": "Villa Enclave 2", "floor": 1, "unit_number": "Villa 12", "unit_type": "5 BHK Presidential Villa", "area": 7500, "price": Decimal("82000000"), "status": "Sold"},
                    {"tower": "Villa Enclave 2", "floor": 1, "unit_number": "Villa 15", "unit_type": "4 BHK Grand Villa", "area": 4800, "price": Decimal("52000000"), "status": "Available"},
                ]
            },
            {
                "name": "Emerald Green Meadows",
                "developer_name": "Godrej Properties",
                "location": "Sarjapur Road, Tech Corridor",
                "city": "Bengaluru",
                "property_type": "Apartment",
                "price_min": Decimal("9500000"),
                "price_max": Decimal("16500000"),
                "total_units": 60,
                "status": "Pre-Launch",
                "description": "Eco-friendly sustainable residential community with 80% open lush greenery, zero carbon imprint design, and seamless connectivity to Electronic City.",
                "amenities": ["80% Green Open Spaces", "Olympic Size Lap Pool", "Kids Adventure Park", "Co-working Lounge", "Jogging Track", "Cricket Practice Net", "Multi-tier Security"],
                "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80",
                "brochure_url": "https://example.com/brochures/emerald-meadows.pdf",
                "units": [
                    {"tower": "Oak Tower", "floor": 3, "unit_number": "O-304", "unit_type": "2 BHK", "area": 1150, "price": Decimal("9800000"), "status": "Available"},
                    {"tower": "Oak Tower", "floor": 7, "unit_number": "O-701", "unit_type": "3 BHK", "area": 1580, "price": Decimal("13800000"), "status": "Available"},
                    {"tower": "Pine Tower", "floor": 5, "unit_number": "P-502", "unit_type": "3 BHK", "area": 1620, "price": Decimal("14200000"), "status": "Reserved"},
                    {"tower": "Pine Tower", "floor": 9, "unit_number": "P-903", "unit_type": "3.5 BHK", "area": 1850, "price": Decimal("16500000"), "status": "Sold"},
                ]
            },
            {
                "name": "Vertex Business Park & Commercial Suites",
                "developer_name": "RMZ Commercial Spaces",
                "location": "Whitefield EPIP Zone",
                "city": "Bengaluru",
                "property_type": "Commercial",
                "price_min": Decimal("22000000"),
                "price_max": Decimal("65000000"),
                "total_units": 32,
                "status": "Ready to Move",
                "description": "LEED Gold certified modern IT business park and executive boutique office spaces with central amphitheater and dedicated multi-level parking.",
                "amenities": ["Grade-A LEED Gold Certified", "High Speed Elevators", "Auditorium & Boardrooms", "Food Court & Fine Dining", "Multi-level Car Parking", "100% DG Power Backup"],
                "image_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80",
                "brochure_url": "https://example.com/brochures/vertex-commercial.pdf",
                "units": [
                    {"tower": "Wing A", "floor": 2, "unit_number": "Suite 201", "unit_type": "Commercial Office", "area": 2400, "price": Decimal("24500000"), "status": "Available"},
                    {"tower": "Wing A", "floor": 4, "unit_number": "Suite 405", "unit_type": "Commercial Office", "area": 3800, "price": Decimal("41000000"), "status": "Reserved"},
                    {"tower": "Wing B", "floor": 5, "unit_number": "Suite 502", "unit_type": "Commercial Office", "area": 5500, "price": Decimal("62000000"), "status": "Available"},
                ]
            },
            {
                "name": "The Crown Penthouse Suites",
                "developer_name": "Prestige Sky Homes",
                "location": "MG Road CBD",
                "city": "Bengaluru",
                "property_type": "Penthouse",
                "price_min": Decimal("55000000"),
                "price_max": Decimal("95000000"),
                "total_units": 16,
                "status": "Under Construction",
                "description": "Panoramic duplex penthouses overlooking Cubbon Park with private temperature-controlled rooftop pools and bespoke Italian interiors.",
                "amenities": ["Helipad Access", "Private Rooftop Pool", "Concierge Butler", "Private Wine Cellar", "Duplex Living", "Triple Glazed Acoustic Glass"],
                "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80",
                "brochure_url": "https://example.com/brochures/the-crown.pdf",
                "units": [
                    {"tower": "Imperial Tower", "floor": 28, "unit_number": "Sky-2801", "unit_type": "4 BHK Duplex", "area": 4800, "price": Decimal("58000000"), "status": "Available"},
                    {"tower": "Imperial Tower", "floor": 30, "unit_number": "Sky-3001", "unit_type": "5 BHK Grand Duplex", "area": 6500, "price": Decimal("85000000"), "status": "Reserved"},
                ]
            },
            {
                "name": "Serene Woods Eco-Villas",
                "developer_name": "Total Environment Crafts",
                "location": "Kanakapura Road",
                "city": "Bengaluru",
                "property_type": "Villa",
                "price_min": Decimal("32000000"),
                "price_max": Decimal("58000000"),
                "total_units": 28,
                "status": "Ready to Move",
                "description": "Earth-sheltered handcrafted luxury villas surrounded by natural forest groves and private organic fruit orchards.",
                "amenities": ["Earth-Sheltered Roofs", "Natural Lake", "Organic Vegetable Farm", "Clubhouse & Yoga Pavilions", "Natural Stone Architecture"],
                "image_url": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1000&auto=format&fit=crop&q=80",
                "brochure_url": "https://example.com/brochures/serene-woods.pdf",
                "units": [
                    {"tower": "Grove 1", "floor": 1, "unit_number": "Villa G-08", "unit_type": "4 BHK Forest Villa", "area": 3900, "price": Decimal("38000000"), "status": "Available"},
                    {"tower": "Grove 2", "floor": 1, "unit_number": "Villa G-14", "unit_type": "4.5 BHK Lake Villa", "area": 4400, "price": Decimal("46000000"), "status": "Available"},
                ]
            }
        ]

        created_projects = []
        for p_data in projects_data:
            units = p_data.pop("units")
            project, p_created = Project.objects.get_or_create(
                organization=org,
                name=p_data["name"],
                defaults=p_data
            )
            created_projects.append(project)
            for u in units:
                PropertyUnit.objects.get_or_create(
                    organization=org,
                    project=project,
                    unit_number=u["unit_number"],
                    tower=u["tower"],
                    defaults={
                        "floor": u["floor"],
                        "unit_type": u["unit_type"],
                        "area_sqft": Decimal(str(u["area"])),
                        "price": u["price"],
                        "status": u["status"],
                    }
                )

        self.stdout.write(self.style.SUCCESS(f"Processed {len(created_projects)} projects with inventory units."))

        # 4. Realistic 80 Leads matching target dashboard sources & pipeline stages
        lead_templates = [
            # Full Name, Phone, Email, Source, Campaign, Project Name, Min Budget, Max Budget, Location, Priority, Status, Agent Index (-1 for unassigned)
            # Social Profiles
            ("Vineeth Kumar", "+91 98201 10001", "vineeth.k@example.com", "Facebook", "Festive Property Showcase", "Skyline Pinnacle Residences", 21500000, 24000000, "Indiranagar", "High", "Site Visit Scheduled", 3), # Varun
            ("Leo Philips", "+91 98201 10002", "leo.philips@example.com", "Google Ads", "Commercial Suites Bangalore", "Vertex Business Park & Commercial Suites", 25000000, 42000000, "Whitefield", "Urgent", "Interested", 4), # Sneha
            ("Angel Herwitz", "+91 98201 10003", "angel.h@example.com", "Facebook", "Luxury Villa Showcase", "Azure Palms Ultra-Luxury Villas", 50000000, 68000000, "North Bengaluru", "High", "Site Visit Scheduled", 5), # Amitav
            ("Ashlynn Westervelt", "+91 98201 10004", "ashlynn.w@example.com", "Instagram", "Eco Living Bangalore", "Emerald Green Meadows", 12000000, 15000000, "Sarjapur", "Medium", "Site Visit Scheduled", 2), # Priya
            ("Lydia Geidt", "+91 98201 10005", "lydia.g@example.com", "Google Form", "Pre-Launch Registration", "Skyline Pinnacle Residences", 19000000, 22000000, "Indiranagar", "High", "Site Visit Scheduled", 3), # Varun
            ("Kavita Sundaram", "+91 98201 10006", "kavita.s@example.com", "Facebook", "Diwali Exclusive Ads", "Skyline Pinnacle Residences", 20000000, 24000000, "Indiranagar", "High", "New", 0),
            ("Arjun Singhania", "+91 98201 10007", "arjun.singhania@example.com", "Referral", "Director Circle", "Azure Palms Ultra-Luxury Villas", 50000000, 70000000, "North Bengaluru", "Urgent", "Negotiation", 1),
            ("Rohan Bhattacharya", "+91 98201 10008", "rohan.bhatt@example.com", "Google Ads", "Bengaluru Luxury Search", "Skyline Pinnacle Residences", 18000000, 22000000, "Indiranagar", "Medium", "Contacted", 2),
            ("Dr. Meera Iyer", "+91 98201 10009", "dr.meera@example.com", "Website", "Organic Inbound", "Emerald Green Meadows", 11000000, 15000000, "Sarjapur", "High", "Site Visit Scheduled", 0),
            ("Sameer Deshmukh", "+91 98201 10010", "sameer.d@example.com", "Channel Partner", "Knight Frank Channel", "Vertex Business Park & Commercial Suites", 25000000, 45000000, "Whitefield", "High", "Site Visit Done", 1),
            ("Sunita Rao", "+91 98201 10011", "sunita.rao@example.com", "Direct / Walk-in", "Sales Gallery Walkin", "Emerald Green Meadows", 9500000, 12000000, "Sarjapur", "Medium", "Interested", 2),
            ("Naveen Reddy", "+91 98201 10012", "naveen.reddy@example.com", "Magicbricks", "MagicBricks Premium", "Skyline Pinnacle Residences", 21000000, 23000000, "Indiranagar", "Urgent", "Booked", 3),
            ("Gaurav Kapoor", "+91 98201 10013", "gaurav.k@example.com", "Google Ads", "HNI Villa Campaign", "Azure Palms Ultra-Luxury Villas", 45000000, 55000000, "North Bengaluru", "Low", "Lost", 1),
            ("Pooja Nair", "+91 98201 10014", "pooja.nair@example.com", "Website", "Brochure Download Form", "Emerald Green Meadows", 12000000, 16000000, "Sarjapur", "Medium", "Contacted", 2),
            ("Harish Narayanan", "+91 98201 10015", "harish.n@example.com", "Instagram", "Luxury Living IG Ads", "Azure Palms Ultra-Luxury Villas", 60000000, 80000000, "North Bengaluru", "High", "Interested", 4),
            ("Deepak Chawla", "+91 98201 10016", "deepak.c@example.com", "Referral", "Existing Resident Club", "Skyline Pinnacle Residences", 22000000, 25000000, "Indiranagar", "High", "Site Visit Scheduled", 1),
            ("Shruti Saxena", "+91 98201 10017", "shruti.s@example.com", "Website", "Virtual Tour Signup", "Emerald Green Meadows", 10000000, 14000000, "Sarjapur", "Low", "New", 5),
            ("Aditya Roy", "+91 98201 10018", "aditya.roy@example.com", "Channel Partner", "CBRE Tech Channel", "Vertex Business Park & Commercial Suites", 30000000, 60000000, "Whitefield", "Urgent", "Negotiation", 0),
            ("Bhavna Kulkarni", "+91 98201 10019", "bhavna.k@example.com", "Google Ads", "Green Apartments Ad", "Emerald Green Meadows", 11000000, 13500000, "Sarjapur", "Medium", "Site Visit Done", 1),
            ("Tushar Sen", "+91 98201 10020", "tushar.sen@example.com", "Facebook", "Festive Property Gala", "Skyline Pinnacle Residences", 19000000, 22500000, "Indiranagar", "Medium", "Booked", 2),
            ("Neha Menon", "+91 98201 10021", "neha.menon@example.com", "99acres", "99acres Banner", "Azure Palms Ultra-Luxury Villas", 48000000, 52000000, "North Bengaluru", "Low", "Lost", 0),
            ("Venkatesh Prasad", "+91 98201 10022", "venkat.p@example.com", "Direct / Walk-in", "Roadshow Pavilion", "Emerald Green Meadows", 10000000, 13000000, "Sarjapur", "Medium", "New", -1), # Unassigned
            ("Dr. Alok Bansal", "+91 98201 10023", "dr.alok@example.com", "Referral", "Doctors Fraternity", "Skyline Pinnacle Residences", 21000000, 34000000, "Indiranagar", "High", "Site Visit Scheduled", 2),
            ("Divya Murthy", "+91 98201 10024", "divya.m@example.com", "Website", "Contact Us Page", "Azure Palms Ultra-Luxury Villas", 50000000, 75000000, "North Bengaluru", "Urgent", "Site Visit Done", 3),
            ("Karan Johar Sharma", "+91 98201 10025", "karan.sharma@example.com", "Google Ads", "Commercial Real Estate", "Vertex Business Park & Commercial Suites", 22000000, 35000000, "Whitefield", "High", "Negotiation", 4),
            ("Radhika Pillai", "+91 98201 10026", "radhika.p@example.com", "Instagram", "Retirement Haven Ads", "Emerald Green Meadows", 12000000, 15000000, "Sarjapur", "Medium", "Interested", 5),
            ("Mohit Varma", "+91 98201 10027", "mohit.varma@example.com", "Direct / Walk-in", "Weekend Open House", "Skyline Pinnacle Residences", 18500000, 22000000, "Indiranagar", "High", "Contacted", 0),
            ("Siddharth Gupta", "+91 98201 10028", "siddharth.g@example.com", "Housing", "Housing.com Lead", "Emerald Green Meadows", 9500000, 11500000, "Sarjapur", "Low", "New", -1), # Unassigned
            ("Ayesha Siddiqui", "+91 98201 10029", "ayesha.s@example.com", "Referral", "High Net Worth NRI", "Azure Palms Ultra-Luxury Villas", 65000000, 82000000, "North Bengaluru", "Urgent", "Booked", 1),
            ("Farhan Akhtar Khan", "+91 98201 10030", "farhan.akhtar@example.com", "Google Ads", "Executive Suites Search", "Vertex Business Park & Commercial Suites", 25000000, 38000000, "Whitefield", "Low", "Lost", 2),
            ("Swati Mukherjee", "+91 98201 10031", "swati.m@example.com", "Website", "Homepage Hero Form", "Skyline Pinnacle Residences", 20000000, 23500000, "Indiranagar", "Medium", "Contacted", 3),
            ("Nikhil Kothari", "+91 98201 10032", "nikhil.k@example.com", "Channel Partner", "JLL Elite Network", "Skyline Pinnacle Residences", 22000000, 30000000, "Indiranagar", "High", "Interested", 4),
            ("Tanvi Joshi", "+91 98201 10033", "tanvi.j@example.com", "Facebook", "Luxury Duplex Showcase", "Azure Palms Ultra-Luxury Villas", 45000000, 60000000, "North Bengaluru", "High", "Site Visit Scheduled", 5),
            ("Abhishek Hegde", "+91 98201 10034", "abhishek.h@example.com", "Direct / Walk-in", "Mall Pop-up Stall", "Emerald Green Meadows", 10500000, 13000000, "Sarjapur", "Medium", "Site Visit Done", 0),
            ("Geeta Raman", "+91 98201 10035", "geeta.raman@example.com", "Google Ads", "Ready Villas Search", "Azure Palms Ultra-Luxury Villas", 52000000, 68000000, "North Bengaluru", "Urgent", "Negotiation", 1),
            ("Vivek Oberoi Das", "+91 98201 10036", "vivek.o@example.com", "Website", "Floor Plan Download", "Emerald Green Meadows", 11000000, 14500000, "Sarjapur", "Medium", "New", -1), # Unassigned
            ("Pallavi Rao", "+91 98201 10037", "pallavi.rao@example.com", "Facebook", "NRI Investment Series", "Vertex Business Park & Commercial Suites", 35000000, 50000000, "Whitefield", "High", "Contacted", 2),
            ("Manish Tiwari", "+91 98201 10038", "manish.t@example.com", "Magicbricks", "MagicBricks HNI", "Skyline Pinnacle Residences", 21500000, 24500000, "Indiranagar", "High", "Booked", 3),
            ("Sangeeta Goyal", "+91 98201 10039", "sangeeta.g@example.com", "Referral", "Alumni Association", "Azure Palms Ultra-Luxury Villas", 45000000, 50000000, "North Bengaluru", "Low", "Lost", 4),
            ("Rakesh Jhunjhunwala N", "+91 98201 10040", "rakesh.jn@example.com", "Channel Partner", "Family Office Partner", "The Crown Penthouse Suites", 55000000, 75000000, "CBD", "Urgent", "Site Visit Scheduled", 5),
            # Additional 3rd party and portal leads
            ("Pawan Kalyan", "+91 98201 10041", "pawan.k@example.com", "Housing", "Housing Search Filter", "The Crown Penthouse Suites", 60000000, 85000000, "CBD", "High", "Contacted", 0),
            ("Ritika Singhal", "+91 98201 10042", "ritika.s@example.com", "Housing", "Housing Spotlight", "Emerald Green Meadows", 12000000, 14000000, "Sarjapur", "Medium", "Interested", 1),
            ("Anirudh Ravichander", "+91 98201 10043", "anirudh.r@example.com", "Magicbricks", "Magicbricks Luxury Search", "The Crown Penthouse Suites", 65000000, 95000000, "CBD", "Urgent", "Booked", 3),
            ("Simran Kaur", "+91 98201 10044", "simran.k@example.com", "99acres", "99acres Premium Verified", "Skyline Pinnacle Residences", 22000000, 26000000, "Indiranagar", "High", "Site Visit Done", 2),
            ("Kishore Kumar", "+91 98201 10045", "kishore.k@example.com", "Quikr", "Quikr Homes Verified", "Emerald Green Meadows", 9800000, 12500000, "Sarjapur", "Low", "Contacted", 4),
            ("Zoya Akhtar", "+91 98201 10046", "zoya.a@example.com", "Quikr", "Quikr City Guide", "Serene Woods Eco-Villas", 34000000, 48000000, "Kanakapura", "Medium", "Interested", 5),
            ("Suresh Raina", "+91 98201 10047", "suresh.r@example.com", "Justdial", "Justdial Real Estate Verified", "Vertex Business Park & Commercial Suites", 28000000, 42000000, "Whitefield", "High", "Contacted", 0),
            ("Anupam Kher", "+91 98201 10048", "anupam.k@example.com", "Justdial", "Justdial Bangalore Inbound", "Serene Woods Eco-Villas", 36000000, 52000000, "Kanakapura", "Medium", "New", -1), # Unassigned
            ("Tarun Tahiliani", "+91 98201 10049", "tarun.t@example.com", "QR Code", "Site Hoarding QR Scan", "The Crown Penthouse Suites", 70000000, 95000000, "CBD", "Urgent", "Site Visit Done", 3),
            ("Mira Kapoor", "+91 98201 10050", "mira.k@example.com", "QR Code", "Brochure Backcover QR", "Serene Woods Eco-Villas", 35000000, 45000000, "Kanakapura", "High", "Interested", 4),
            ("Gautam Adani Jr", "+91 98201 10051", "gautam.a@example.com", "Email", "Inbound Corporate Email", "Vertex Business Park & Commercial Suites", 45000000, 65000000, "Whitefield", "Urgent", "Negotiation", 1),
            ("Kavya Maran", "+91 98201 10052", "kavya.m@example.com", "Google Form", "HNW Villa Webinar Form", "Azure Palms Ultra-Luxury Villas", 55000000, 78000000, "North Bengaluru", "High", "Site Visit Scheduled", 2),
            ("Prashant Neel", "+91 98201 10053", "prashant.n@example.com", "Google Form", "Luxury Penthouse RSVP", "The Crown Penthouse Suites", 65000000, 90000000, "CBD", "Urgent", "Site Visit Done", 5),
            ("Natasha Poonawalla", "+91 98201 10054", "natasha.p@example.com", "Facebook", "Luxury Fashion & Living", "The Crown Penthouse Suites", 80000000, 95000000, "CBD", "Urgent", "Booked", 3),
            ("Yash Gowda", "+91 98201 10055", "yash.g@example.com", "Instagram", "Bangalore Luxury Influencer", "Serene Woods Eco-Villas", 40000000, 58000000, "Kanakapura", "High", "Site Visit Scheduled", 4),
            ("Nisha Agarwal", "+91 98201 10056", "nisha.ag@example.com", "Google Ads", "2 BHK Ready Apartments", "Emerald Green Meadows", 9800000, 11500000, "Sarjapur", "Medium", "Contacted", 0),
            ("Raghav Juyal", "+91 98201 10057", "raghav.j@example.com", "Facebook", "Tech Park Residences Ad", "Emerald Green Meadows", 11500000, 13800000, "Sarjapur", "Low", "Lost", 1),
            ("Shilpa Shetty K", "+91 98201 10058", "shilpa.s@example.com", "Referral", "Celebrity Client Referral", "Azure Palms Ultra-Luxury Villas", 60000000, 82000000, "North Bengaluru", "Urgent", "Negotiation", 2),
            ("Vijay Deverakonda", "+91 98201 10059", "vijay.d@example.com", "Website", "Private Viewing Portal", "The Crown Penthouse Suites", 75000000, 95000000, "CBD", "High", "Site Visit Done", 5),
            ("Rashmika Mandanna", "+91 98201 10060", "rashmika.m@example.com", "Instagram", "Modern Villas Reel Ad", "Serene Woods Eco-Villas", 38000000, 50000000, "Kanakapura", "High", "Site Visit Scheduled", 3),
            ("Anand Mahindra", "+91 98201 10061", "anand.m@example.com", "Channel Partner", "Executive Board Channel", "Vertex Business Park & Commercial Suites", 50000000, 65000000, "Whitefield", "High", "Contacted", 4),
            ("Sudha Murty", "+91 98201 10062", "sudha.m@example.com", "Referral", "Philanthropy Trust Office", "Serene Woods Eco-Villas", 32000000, 42000000, "Kanakapura", "Medium", "Site Visit Done", 0),
            ("Nandan Nilekani", "+91 98201 10063", "nandan.n@example.com", "Website", "VIP Inbound Concierge", "Skyline Pinnacle Residences", 30000000, 34000000, "Indiranagar", "High", "Contacted", 1),
            ("Aman Gupta", "+91 98201 10064", "aman.boAt@example.com", "Google Ads", "Penthouse Commercial CBD", "The Crown Penthouse Suites", 58000000, 75000000, "CBD", "High", "Interested", 2),
            ("Ashneer Grover", "+91 98201 10065", "ashneer.g@example.com", "Meta Ads", "Commercial ROI Whitefield", "Vertex Business Park & Commercial Suites", 35000000, 55000000, "Whitefield", "Low", "Lost", 4),
            ("Namita Thapar", "+91 98201 10066", "namita.t@example.com", "Referral", "Healthcare Leaders Forum", "Azure Palms Ultra-Luxury Villas", 48000000, 65000000, "North Bengaluru", "High", "Site Visit Done", 3),
            ("Peyush Bansal", "+91 98201 10067", "peyush.b@example.com", "Google Form", "Tech Founders Housing Form", "Serene Woods Eco-Villas", 42000000, 58000000, "Kanakapura", "High", "Negotiation", 5),
            ("Vineeta Singh", "+91 98201 10068", "vineeta.s@example.com", "Instagram", "Sugar Beauty Living IG", "Skyline Pinnacle Residences", 22500000, 28000000, "Indiranagar", "Medium", "Contacted", 0),
            ("Ghazal Alagh", "+91 98201 10069", "ghazal.a@example.com", "Facebook", "Clean Living Homes Ad", "Emerald Green Meadows", 13800000, 16500000, "Sarjapur", "High", "Interested", 1),
            ("Deepinder Goyal", "+91 98201 10070", "deepinder.g@example.com", "Direct / Walk-in", "Executive Weekend Walkin", "The Crown Penthouse Suites", 85000000, 95000000, "CBD", "Urgent", "New", -1), # Unassigned
            ("Sriharsha Majety", "+91 98201 10071", "sriharsha.m@example.com", "Google Ads", "Bangalore Tech Park Suites", "Vertex Business Park & Commercial Suites", 40000000, 62000000, "Whitefield", "High", "Contacted", 2),
            ("Bhavish Aggarwal", "+91 98201 10072", "bhavish.a@example.com", "Email", "Direct Email Inquiry", "Azure Palms Ultra-Luxury Villas", 52000000, 70000000, "North Bengaluru", "Urgent", "Interested", 3),
            ("Byju Raveendran", "+91 98201 10073", "byju.r@example.com", "Website", "Inquiry Form", "Emerald Green Meadows", 9800000, 12000000, "Sarjapur", "Low", "Lost", 4),
            ("Kunal Shah", "+91 98201 10074", "kunal.shah@example.com", "Referral", "CRED Club Partner", "The Crown Penthouse Suites", 80000000, 95000000, "CBD", "Urgent", "Negotiation", 5),
            ("Ritesh Agarwal", "+91 98201 10075", "ritesh.a@example.com", "Channel Partner", "Hospitality Real Estate Channel", "Vertex Business Park & Commercial Suites", 38000000, 52000000, "Whitefield", "High", "Site Visit Scheduled", 0),
        ]

        project_map = {p.name: p for p in created_projects}
        now = timezone.now()

        created_leads_count = 0
        for i, lead_spec in enumerate(lead_templates):
            full_name, phone, email, source, campaign, proj_name, min_b, max_b, pref_loc, priority, status, exec_idx = lead_spec
            assigned_exec = None if exec_idx == -1 else executives[exec_idx % len(executives)]
            project = project_map.get(proj_name)

            # Follow up date relative to today
            if i % 5 == 0:
                followup_date = now + timedelta(hours=random.randint(1, 5)) # Today
            elif i % 5 == 1:
                followup_date = now - timedelta(days=random.randint(1, 3), hours=random.randint(2, 6)) # Overdue
            elif i % 5 == 2:
                followup_date = now + timedelta(days=1, hours=random.randint(2, 8)) # Tomorrow
            elif i % 5 == 3:
                followup_date = now + timedelta(days=random.randint(2, 6), hours=3) # Later this week
            else:
                followup_date = None

            lost_reason = "Customer selected an alternative property closer to workplace" if status == "Lost" else ""
            if status == "Lost" and i % 2 == 0:
                lost_reason = "Customer Not Interested: Deferred real estate purchasing plan"

            booked_amount = Decimal(str(min_b)) if status == "Booked" else None
            booked_date = (now - timedelta(days=random.randint(2, 14))) if status == "Booked" else None

            lead, l_created = Lead.objects.get_or_create(
                organization=org,
                phone=phone,
                defaults={
                    "full_name": full_name,
                    "email": email,
                    "source": source,
                    "campaign": campaign,
                    "interested_project": project,
                    "min_budget": Decimal(str(min_b)),
                    "max_budget": Decimal(str(max_b)),
                    "preferred_location": pref_loc,
                    "priority": priority,
                    "status": status,
                    "assigned_agent": assigned_exec,
                    "next_followup_date": followup_date,
                    "lost_reason": lost_reason,
                    "booked_amount": booked_amount,
                    "booked_date": booked_date,
                    "notes": f"High intent prospect interested in premium unit configuration at {proj_name}. (Seeded Demo Record)",
                }
            )

            # Update existing leads if re-seeded so status/dates are fresh
            lead.status = status
            lead.source = source
            lead.assigned_agent = assigned_exec
            lead.interested_project = project
            if status == "Booked":
                lead.booked_amount = Decimal(str(min_b))
                lead.booked_date = (now - timedelta(days=random.randint(2, 14)))
            lead.next_followup_date = followup_date
            lead.save()

            created_leads_count += 1

            # 5. Activity log
            LeadActivity.objects.get_or_create(
                organization=org,
                lead=lead,
                title="Lead captured in ESTATEVO CRM",
                defaults={
                    "performed_by": assigned_exec or created_users["manager"],
                    "activity_type": "Lead Created",
                    "description": f"Inbound lead received via {source} ({campaign}). Assigned to {assigned_exec.display_name if assigned_exec else 'Unassigned'}."
                }
            )

            # 6. Tasks / Follow-ups
            if followup_date and assigned_exec:
                task_types = ["Call", "Meeting", "WhatsApp follow-up", "SMS", "Email"]
                task_type = task_types[i % len(task_types)]
                task_status = "Pending" if followup_date > (now - timedelta(days=5)) else "Completed"
                FollowUpTask.objects.get_or_create(
                    organization=org,
                    lead=lead,
                    due_datetime=followup_date,
                    defaults={
                        "assigned_to": assigned_exec,
                        "created_by": created_users["manager"],
                        "task_type": task_type,
                        "priority": priority,
                        "status": task_status,
                        "notes": f"Follow up regarding floor plans and unit availability at {proj_name}.",
                        "completed_at": (now - timedelta(days=1)) if task_status == "Completed" else None,
                        "outcome": "Prospect confirmed receipt of inventory sheet." if task_status == "Completed" else "",
                    }
                )

            # 7. Site Visits
            if status in ["Site Visit Scheduled", "Site Visit Done", "Negotiation", "Booked"] and assigned_exec:
                visit_status = "Completed" if status in ["Site Visit Done", "Negotiation", "Booked"] else "Scheduled"
                
                # Check for specific screenshot matching visits
                if "Vineeth Kumar" in full_name:
                    visit_date = (now + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
                elif "Angel Herwitz" in full_name:
                    visit_date = (now + timedelta(days=1)).replace(hour=13, minute=0, second=0, microsecond=0)
                elif "Ashlynn Westervelt" in full_name:
                    visit_date = (now + timedelta(days=1)).replace(hour=17, minute=30, second=0, microsecond=0)
                elif "Lydia Geidt" in full_name:
                    visit_date = (now + timedelta(days=1)).replace(hour=19, minute=0, second=0, microsecond=0)
                elif visit_status == "Completed":
                    visit_date = now - timedelta(days=random.randint(1, 5), hours=random.randint(1, 4))
                else:
                    visit_date = now + timedelta(days=random.randint(1, 5), hours=random.randint(1, 5))

                SiteVisit.objects.get_or_create(
                    organization=org,
                    lead=lead,
                    project=project,
                    scheduled_datetime=visit_date,
                    defaults={
                        "assigned_executive": assigned_exec,
                        "status": visit_status,
                        "notes": f"Guided tour of model apartment and lifestyle clubhouse at {project.name}.",
                        "completed_at": visit_date if visit_status == "Completed" else None,
                        "outcome": "Client was impressed with the layout. Requested pricing breakdown." if visit_status == "Completed" else "",
                    }
                )

        # 8. Add explicit meetings matching screenshot for Tomorrow
        philips_lead = Lead.objects.filter(full_name__icontains="Leo Philips").first()
        if philips_lead:
            meeting_date_1 = (now + timedelta(days=1)).replace(hour=12, minute=0, second=0, microsecond=0)
            FollowUpTask.objects.get_or_create(
                organization=org,
                lead=philips_lead,
                due_datetime=meeting_date_1,
                defaults={
                    "assigned_to": created_users["sarah.agent"],
                    "created_by": created_users["manager"],
                    "task_type": "Meeting",
                    "priority": "Urgent",
                    "status": "Pending",
                    "notes": "Meeting scheduled with Leo Philips at Whitefield Executive Sales Suite.",
                }
            )
            meeting_date_2 = (now + timedelta(days=1)).replace(hour=14, minute=30, second=0, microsecond=0)
            FollowUpTask.objects.get_or_create(
                organization=org,
                lead=philips_lead,
                due_datetime=meeting_date_2,
                defaults={
                    "assigned_to": created_users["sneha.agent"],
                    "created_by": created_users["manager"],
                    "task_type": "Meeting",
                    "priority": "High",
                    "status": "Pending",
                    "notes": "Follow-up meeting with Leo Philips on commercial contract terms.",
                }
            )

        self.stdout.write(self.style.SUCCESS(f"Successfully processed {len(lead_templates)} leads (fresh/updated: {created_leads_count})."))
        self.stdout.write(self.style.SUCCESS("ESTATEVO demo database seeding complete!"))
