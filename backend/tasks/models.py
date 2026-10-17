from django.db import models

class FollowUpTask(models.Model):
    TASK_TYPE_CHOICES = (
        ('Call', 'Call'),
        ('Meeting', 'Meeting'),
        ('Email', 'Email'),
        ('WhatsApp follow-up', 'WhatsApp follow-up'),
        ('SMS', 'SMS'),
        ('General reminder', 'General reminder'),
    )

    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    )

    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )

    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    lead = models.ForeignKey(
        'leads.Lead',
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    assigned_to = models.ForeignKey(
        'accounts.CustomUser',
        on_delete=models.CASCADE,
        related_name='assigned_tasks'
    )
    created_by = models.ForeignKey(
        'accounts.CustomUser',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='created_tasks'
    )
    task_type = models.CharField(max_length=50, choices=TASK_TYPE_CHOICES, default='Call')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    due_datetime = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True)
    outcome = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_datetime']
        indexes = [
            models.Index(fields=['organization', 'status', 'due_datetime']),
            models.Index(fields=['organization', 'assigned_to']),
        ]

    def __str__(self):
        return f"{self.task_type} for {self.lead.full_name} due {self.due_datetime.strftime('%Y-%m-%d %H:%M')}"
