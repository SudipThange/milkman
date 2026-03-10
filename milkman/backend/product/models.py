from django.db import models
from category.models import Category
from django.core.validators import MinValueValidator

class Product(models.Model):
    name = models.CharField(max_length=100)
    quantity = models.CharField(max_length=30)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators = [MinValueValidator(0)])
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
