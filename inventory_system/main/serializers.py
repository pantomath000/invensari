from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from .models import Transaction, User, StockItem, Product, ProductIngredient
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils.timezone import localtime

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['user_id'] = user.id
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        print("CustomTokenObtainPairSerializer validate called")
        data['user_id'] = self.user.id
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    profile_picture = serializers.ImageField(required=False)  # Allow profile picture uploads

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'phone_number', 'address', 'business_name', 'profile_picture']  # Include profile_picture

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Update the profile picture if provided
        profile_picture = validated_data.pop('profile_picture', None)
        if profile_picture:
            instance.profile_picture = profile_picture

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class StockItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockItem
        fields = ['id', 'name', 'quantity', 'unit']

class ProductIngredientSerializer(serializers.ModelSerializer):
    stock_item = serializers.PrimaryKeyRelatedField(queryset=StockItem.objects.all())
    stock_item_name = serializers.CharField(source='stock_item.name', read_only=True)

    class Meta:
        model = ProductIngredient
        fields = ['stock_item', 'stock_item_name', 'quantity_required']

class ProductSerializer(serializers.ModelSerializer):
    ingredients = ProductIngredientSerializer(many=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'unit', 'ingredients']

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients', [])
        product = Product.objects.create(**validated_data)

        for ingredient_data in ingredients_data:
            ProductIngredient.objects.create(
                product=product,
                stock_item=ingredient_data['stock_item'],
                quantity_required=ingredient_data['quantity_required']
            )
        return product

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.unit = validated_data.get('unit', instance.unit)
        instance.save()

        ingredients_data = validated_data.get('ingredients')
        if ingredients_data:
            instance.ingredients.all().delete()
            for ingredient_data in ingredients_data:
                ProductIngredient.objects.create(
                    product=instance,
                    stock_item=ingredient_data['stock_item'],
                    quantity_required=ingredient_data['quantity_required']
                )
        return instance

class TransactionSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity_sold = serializers.FloatField()
    product_name = serializers.CharField(source='product.name', read_only=True)
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = ['id', 'product', 'product_name', 'quantity_sold', 'date', 'formatted_date']

    def get_formatted_date(self, obj):
        return localtime(obj.date).strftime('%Y-%m-%d %H:%M:%S')

    def create(self, validated_data):
        transaction = Transaction(**validated_data)
        transaction.save()
        return transaction
