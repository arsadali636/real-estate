from django.db import models

class Lead(models.Model):
    SOURCE_CHOICES = (
        ('Website', 'Website'),
        ('Facebook', 'Facebook'),
        ('Meta Ads', 'Meta Ads'),
        ('Google Ads', 'Google Ads'),
        ('Google Form', 'Google Form'),
        ('Instagram', 'Instagram'),
        ('Housing', 'Housing'),
        ('Magicbricks', 'Magicbricks'),
        ('99acres', '99acres'),
        ('Quikr', 'Quikr'),
        ('Justdial', 'Justdial'),
        ('Direct / Walk-in', 'Direct / Walk-in'),
        ('Walk-in', 'Walk-in'),
        ('Referral', 'Referral'),
        ('Channel Partner', 'Channel Partner'),
        ('Property Portal', 'Property Portal'),
        ('QR Code', 'QR Code'),
        ('Email', 'Email'),
        ('Other', 'Other'),
    )

    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    )

    STATUS_CHOICES = (
        ('New', 'New'),
        ('Contacted', 'Contacted'),
        ('Interested', 'Interested'),
        ('Site Visit Scheduled', 'Site Visit Scheduled'),
        ('Site Visit Done', 'Site Visit Done'),
        ('Negotiation', 'Negotiation'),
        ('Booked', 'Booked'),
        ('Lost', 'Lost'),
    )

    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='leads'
    )
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True)
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='Website')
    campaign = models.CharField(max_length=100, blank=True)
    interested_project = models.ForeignKey(
        'projects.Project',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='leads'
    )
    min_budget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    max_budget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    preferred_location = models.CharField(max_length=255, blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=40, choices=STATUS_CHOICES, default='New')
    assigned_agent = models.ForeignKey(
        'accounts.CustomUser',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_leads'
    )
    next_followup_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    lost_reason = models.TextField(blank=True)
    booked_date = models.DateTimeField(null=True, blank=True)
    booked_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'phone']),
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'assigned_agent']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.phone}) - {self.status}"
