from django.db import models

class SiteVisit(models.Model):
    STATUS_CHOICES = (
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('No-show', 'No-show'),
    )

    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='site_visits'
    )
    lead = models.ForeignKey(
        'leads.Lead',
        on_delete=models.CASCADE,
        related_name='site_visits'
    )
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='site_visits'
    )
    assigned_executive = models.ForeignKey(
        'accounts.CustomUser',
        on_delete=models.CASCADE,
        related_name='assigned_site_visits'
    )
    scheduled_datetime = models.DateTimeField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Scheduled')
    outcome = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_datetime']
        indexes = [
            models.Index(fields=['organization', 'status', 'scheduled_datetime']),
            models.Index(fields=['organization', 'assigned_executive']),
        ]

    def __str__(self):
        return f"Site Visit: {self.lead.full_name} @ {self.project.name} on {self.scheduled_datetime.strftime('%Y-%m-%d %H:%M')}"
