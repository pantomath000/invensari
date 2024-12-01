from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterUserView, LoginUserView, DashboardDataView, StockItemViewSet, ProductViewSet, TransactionViewSet, IngredientViewSet, ProfileView, ChangePasswordView
from .serializers import CustomTokenObtainPairView
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin

router = DefaultRouter()
router.register(r'stock', StockItemViewSet, basename='stock')
router.register(r'products', ProductViewSet, basename='products')
router.register(r'ingredients', IngredientViewSet, basename='ingredients')
router.register(r'transactions', TransactionViewSet, basename='transactions')

urlpatterns = [
    path('login/', LoginUserView.as_view(), name='login'),
    path('register/', RegisterUserView.as_view(), name='register'),
    path('dashboard/', DashboardDataView.as_view(), name='dashboard'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/<int:pk>/update/', ProfileView.as_view(), name='profile_update'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
