from django.db import models

class LeadActivity(models.Model):
    ACTIVITY_TYPE_CHOICES = (
        ('Lead Created', 'Lead Created'),
        ('Status Changed', 'Status Changed'),
        ('Stage Moved', 'Stage Moved'),
        ('Assigned', 'Assigned'),
        ('Note Added', 'Note Added'),
        ('Call', 'Call'),
        ('WhatsApp', 'WhatsApp'),
        ('Email', 'Email'),
        ('Site Visit Scheduled', 'Site Visit Scheduled'),
        ('Site Visit Completed', 'Site Visit Completed'),
        ('Follow-up Scheduled', 'Follow-up Scheduled'),
        ('Follow-up Completed', 'Follow-up Completed'),
    )

    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='activities'
    )
    lead = models.ForeignKey(
        'leads.Lead',
        on_delete=models.CASCADE,
        related_name='activities'
    )
    performed_by = models.ForeignKey(
        'accounts.CustomUser',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='performed_activities'
    )
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPE_CHOICES, default='Note Added')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.lead.full_name} - {self.activity_type} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
