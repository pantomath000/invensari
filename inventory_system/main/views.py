# main/views.py

from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, StockItem, Product, Transaction, ProductIngredient
from .serializers import UserSerializer, StockItemSerializer, ProductSerializer, TransactionSerializer, ProductIngredientSerializer
from rest_framework.exceptions import ValidationError
from django.db import transaction as db_transaction
from rest_framework.generics import RetrieveUpdateAPIView
from django.db.models.functions import TruncWeek
from django.db.models import Sum
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.timezone import localtime
import logging

# Register and login views
class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user_id': user.id  # Include user ID in the response
            }, status=status.HTTP_200_OK)

# Viewsets for managing stock items, products, and transactions
class StockItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = StockItemSerializer

    def get_queryset(self):
        return StockItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if StockItem.objects.filter(name=serializer.validated_data['name'], user=self.request.user).exists():
            raise ValidationError({"error": "Stock item already exists."})
        serializer.save(user=self.request.user)

class IngredientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductIngredientSerializer

    def get_queryset(self):
        return ProductIngredient.objects.all()

    def destroy(self, request, pk=None):
        ingredient = self.get_object()
        ingredient.delete()
        return Response({"message": "Ingredient deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if Product.objects.filter(name=serializer.validated_data['name'], user=self.request.user).exists():
            raise ValidationError({"error": "Product already exists."})
        serializer.save(user=self.request.user)

class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        # Get the transactions filtered by user
        product_id = self.request.query_params.get('product_id')
        transactions = Transaction.objects.filter(product__user=self.request.user)

        if product_id:
            transactions = transactions.filter(product_id=product_id)

        # Return only the last 100 transactions, ensuring that slicing happens here instead of in `get_object()`
        return transactions.order_by('-date')

    def perform_create(self, serializer):
        with db_transaction.atomic():
            transaction = serializer.save(user=self.request.user)  # Ensure user is set
            transaction.reduce_stock()

    def destroy(self, request, *args, **kwargs):
        # Get the transaction object using the primary key (id) from kwargs
        instance = self.get_object()
        
        # Ensure that stock is reversed before deletion
        instance.reverse_stock()
        
        # Perform the deletion
        self.perform_destroy(instance)

        # Return a 204 response (No Content)
        return Response(status=status.HTTP_204_NO_CONTENT)

class DashboardDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        product_id = request.query_params.get('product_id')
        transactions = Transaction.objects.filter(product__user=request.user)

        if product_id:
            transactions = transactions.filter(product_id=product_id)

        weekly_sales = transactions.annotate(week_day=TruncWeek('date')).values('week_day').annotate(
            total_sales=Sum('quantity_sold'),
            date=TruncWeek('date')  # Include accurate dates
        ).order_by('week_day')

        data = {
            "weekly_sales": [
                {
                    "week_day": sale["week_day"],
                    "total_sales": sale["total_sales"],
                    "date": localtime(sale["week_day"]).strftime('%Y-%m-%d')
                }
                for sale in weekly_sales
            ]
        }
        return Response(data)

class ProfileView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user

    def put(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            # Log and return validation errors
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not user.check_password(current_password):
            return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
