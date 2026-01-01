from django.urls import path, include
from rest_framework_mongoengine.routers import DefaultRouter
from .views import ProjectViewSet, StoreViewSet, OrderViewSet, health, register, login, me, my_projects, create_store, store_by_slug, create_product, products_by_slug, update_product, buy_product, dashboard_summary, dashboard_breakdown, update_store, update_me

router = DefaultRouter()
router.register(r"projects", ProjectViewSet)
router.register(r"stores", StoreViewSet)
router.register(r"orders", OrderViewSet)

urlpatterns = [
    path("health", health),
    path("auth/register", register),
    path("auth/login", login),
    path("auth/me", me),
    path("projects/mine", my_projects),
    path("stores/create", create_store),
    path("stores/by-slug/<slug>", store_by_slug),
    path("stores/update/<sid>", update_store),
    path("products/create", create_product),
    path("products/by-slug/<slug>", products_by_slug),
    path("products/update/<pid>", update_product),
    path("products/buy/<pid>", buy_product),
    path("dashboard/summary", dashboard_summary),
    path("dashboard/breakdown", dashboard_breakdown),
    path("auth/update", update_me),
    path("", include(router.urls)),
]
