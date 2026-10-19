from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('OWNER', 'Owner'),
        ('ADMIN', 'Admin'),
        ('MANAGER', 'Manager'),
        ('TEAM_LEAD', 'Team Lead'),
        ('EXECUTIVE', 'Executive'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='EXECUTIVE')
    team_lead = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='team_members'
    )
    phone = models.CharField(max_length=30, blank=True)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members'
    )
    avatar_url = models.URLField(max_length=500, blank=True)
    job_title = models.CharField(max_length=100, blank=True)

    @property
    def is_owner_or_admin(self):
        return self.is_superuser or self.role in ('OWNER', 'ADMIN')

    @property
    def is_manager_or_above(self):
        return self.is_superuser or self.role in ('OWNER', 'ADMIN', 'MANAGER')

    @property
    def is_team_lead_or_above(self):
        return self.is_superuser or self.role in ('OWNER', 'ADMIN', 'MANAGER', 'TEAM_LEAD')

    @property
    def display_name(self):
        full = f"{self.first_name} {self.last_name}".strip()
        return full if full else self.username

    def __str__(self):
        return f"{self.display_name} ({self.role})"
