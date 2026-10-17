from django.db import models
from django.utils.text import slugify

class Project(models.Model):
    PROPERTY_TYPE_CHOICES = (
        ('Apartment', 'Apartment'),
        ('Villa', 'Villa'),
        ('Penthouse', 'Penthouse'),
        ('Commercial', 'Commercial'),
        ('Plot', 'Plot'),
    )

    STATUS_CHOICES = (
        ('Pre-Launch', 'Pre-Launch'),
        ('Under Construction', 'Under Construction'),
        ('Ready to Move', 'Ready to Move'),
        ('Sold Out', 'Sold Out'),
    )

    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='projects'
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True)
    developer_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    city = models.CharField(max_length=100, default="Bengaluru")
    property_type = models.CharField(max_length=50, choices=PROPERTY_TYPE_CHOICES, default='Apartment')
    price_min = models.DecimalField(max_digits=14, decimal_places=2, default=0.0)
    price_max = models.DecimalField(max_digits=14, decimal_places=2, default=0.0)
    total_units = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Under Construction')
    description = models.TextField(blank=True)
    amenities = models.JSONField(default=list, blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    gallery = models.JSONField(default=list, blank=True)
    brochure_url = models.URLField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) or "project"
        super().save(*args, **kwargs)

    @property
    def available_units_count(self):
        return self.units.filter(status='Available').count()

    @property
    def reserved_units_count(self):
        return self.units.filter(status='Reserved').count()

    @property
    def sold_units_count(self):
        return self.units.filter(status='Sold').count()

    def __str__(self):
        return f"{self.name} - {self.developer_name}"

class PropertyUnit(models.Model):
    STATUS_CHOICES = (
        ('Available', 'Available'),
        ('Reserved', 'Reserved'),
        ('Sold', 'Sold'),
    )

    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='property_units'
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='units'
    )
    unit_number = models.CharField(max_length=50)
    tower = models.CharField(max_length=50, blank=True)
    floor = models.IntegerField(default=1)
    unit_type = models.CharField(max_length=50, default="3 BHK")
    area_sqft = models.DecimalField(max_digits=10, decimal_places=2, default=1200.0)
    price = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    reserved_by = models.ForeignKey(
        'leads.Lead',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='reserved_units'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('project', 'unit_number', 'tower')
        ordering = ['tower', 'floor', 'unit_number']

    def __str__(self):
        return f"{self.project.name} - {self.tower} {self.unit_number} ({self.status})"
