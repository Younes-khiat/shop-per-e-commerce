from rest_framework_mongoengine.serializers import DocumentSerializer
from .models import Project, Store, Order, User, Product


class ProjectSerializer(DocumentSerializer):
    class Meta:
        model = Project
        fields = ("id", "owner", "name", "created_at")


class StoreSerializer(DocumentSerializer):
    class Meta:
        model = Store
        fields = (
            "id",
            "project",
            "owner",
            "name",
            "slug",
            "store_type",
            "email",
            "phone",
            "quote",
            "description",
            "navbar_enabled",
            "logo_position",
            "logo_url",
            "logo_alt",
            "created_at",
        )


class OrderSerializer(DocumentSerializer):
    class Meta:
        model = Order
        fields = ("id", "store", "total", "created_at")


class UserSerializer(DocumentSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "name",
            "first_name",
            "last_name",
            "phone",
            "role",
            "plan",
            "stores",
            "created_at",
        )


class ProductSerializer(DocumentSerializer):
    class Meta:
        model = Product
        fields = (
            "id",
            "store",
            "owner",
            "name",
            "description",
            "images",
            "image_alts",
            "old_price",
            "current_price",
            "orders_count",
            "created_at",
        )
