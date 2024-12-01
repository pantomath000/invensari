from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db import transaction as db_transaction
from rest_framework.exceptions import ValidationError

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15)
    address = models.TextField()
    business_name = models.CharField(max_length=100)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)  # New field for profile picture

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

class StockItem(models.Model):
    name = models.CharField(max_length=100)
    quantity = models.FloatField()
    unit = models.CharField(max_length=10)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stock_items')

    def save(self, *args, **kwargs):
        if not self.pk and StockItem.objects.filter(name=self.name, user=self.user).exists():
            raise ValidationError(f"Stock item '{self.name}' already exists.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.quantity} {self.unit})"

class Product(models.Model):
    name = models.CharField(max_length=100)
    unit = models.CharField(max_length=10)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')

    def save(self, *args, **kwargs):
        if Product.objects.filter(name=self.name, user=self.user).exclude(id=self.id).exists():
            raise ValidationError(f"Product '{self.name}' already exists.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.unit})"

class ProductIngredient(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ingredients')
    stock_item = models.ForeignKey(StockItem, on_delete=models.CASCADE)
    quantity_required = models.FloatField()

class Transaction(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity_sold = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def reduce_stock(self):
        with db_transaction.atomic():
            for ingredient in self.product.ingredients.all():
                required_quantity = ingredient.quantity_required * self.quantity_sold
                stock_item = ingredient.stock_item

                if stock_item.quantity < required_quantity:
                    raise ValidationError(
                        f"Insufficient stock for '{stock_item.name}'. "
                        f"Required: {required_quantity}, Available: {stock_item.quantity}"
                    )

                stock_item.quantity -= required_quantity
                stock_item.save()

    def reverse_stock(self):
        with db_transaction.atomic():
            for ingredient in self.product.ingredients.all():
                returned_quantity = ingredient.quantity_required * self.quantity_sold
                stock_item = ingredient.stock_item
                stock_item.quantity += (returned_quantity / 2)
                stock_item.save()

    def delete(self, *args, **kwargs):
        self.reverse_stock()
        super().delete(*args, **kwargs)
