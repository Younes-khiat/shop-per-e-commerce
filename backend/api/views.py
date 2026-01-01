from rest_framework_mongoengine.viewsets import ModelViewSet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from django.conf import settings
from datetime import datetime, timedelta, timezone
try:
    import jwt as pyjwt  # PyJWT expected
except Exception:
    pyjwt = None
from .models import Project, Store, Order, User, Product
import os
from django.core.files.storage import FileSystemStorage
from .serializers import ProjectSerializer, StoreSerializer, OrderSerializer, UserSerializer, ProductSerializer

class ProjectViewSet(ModelViewSet):
    lookup_field = "id"
    document = Project
    queryset = Project.objects.order_by("-created_at")
    serializer_class = ProjectSerializer

class StoreViewSet(ModelViewSet):
    lookup_field = "id"
    document = Store
    queryset = Store.objects.order_by("-created_at")
    serializer_class = StoreSerializer

class OrderViewSet(ModelViewSet):
    lookup_field = "id"
    document = Order
    queryset = Order.objects.order_by("-created_at")
    serializer_class = OrderSerializer

@api_view(["GET"])
def health(_request):
    return Response({"status": "ok"})


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    data = request.data or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name = data.get("name") or ""
    first_name = data.get("firstName") or ""
    last_name = data.get("lastName") or ""
    phone = data.get("phone") or ""
    role = data.get("role") or "client"
    plan = data.get("plan") or "none"

    if not email or not password:
        return Response({"detail": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects(email=email).first():
        return Response({"detail": "Email already registered"}, status=status.HTTP_409_CONFLICT)

    try:
        user = User(
            email=email,
            password=make_password(password),
            name=name,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role=role,
            plan=plan,
        )
        user.save()
    except Exception as e:
        return Response({"detail": f"Registration failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Return safe subset of fields
    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    data = request.data or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return Response({"detail": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects(email=email).first()
    if not user:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    if not check_password(password, user.password):
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    # Build JWT payload
    now = datetime.now(timezone.utc)
    exp = now + timedelta(days=7)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role or "client",
        "name": user.name or f"{user.first_name or ''} {user.last_name or ''}".strip(),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }

    secret = getattr(settings, "JWT_SECRET", None) or settings.SECRET_KEY
    if pyjwt is None or not hasattr(pyjwt, "encode"):
        return Response({
            "detail": "JWT library not available. Ensure PyJWT is installed and conflicting 'jwt' package is uninstalled."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    token = pyjwt.encode(payload, secret, algorithm="HS256")

    resp = Response({
        "role": payload["role"],
        "name": payload.get("name"),
        "email": payload.get("email"),
    }, status=status.HTTP_200_OK)

    # Set HTTP-only cookie
    resp.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="Lax",
        secure=False,  # set True when serving over HTTPS
        max_age=7 * 24 * 60 * 60,
        path="/",
    )

    return resp


@api_view(["GET"])
@permission_classes([AllowAny])
def me(request):
    token = request.COOKIES.get("access_token")
    if not token:
        return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

    secret = getattr(settings, "JWT_SECRET", None) or settings.SECRET_KEY
    if pyjwt is None or not hasattr(pyjwt, "decode"):
        return Response({
            "detail": "JWT library not available. Ensure PyJWT is installed and conflicting 'jwt' package is uninstalled."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        payload = pyjwt.decode(token, secret, algorithms=["HS256"])
    except Exception as e:
        return Response({"detail": f"Invalid token: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

    user_id = payload.get("sub")
    user = None
    try:
        user = User.objects(id=user_id).first()
    except Exception:
        user = None

    if not user:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    name = user.name or f"{user.first_name or ''} {user.last_name or ''}".strip()
    # Build store slugs map from user's stores
    stores_slugs = {}
    try:
        for sname, sid in (user.stores or {}).items():
            try:
                sdoc = Store.objects(id=sid).first()
                if sdoc:
                    stores_slugs[sname] = sdoc.slug
            except Exception:
                continue
    except Exception:
        stores_slugs = {}

    return Response({
        "id": str(user.id),
        "email": user.email,
        "role": user.role or "client",
        "name": name,
        "plan": user.plan or "none",
        "stores": user.stores or {},
        "stores_slugs": stores_slugs,
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
def create_store(request):
    token = request.COOKIES.get("access_token")
    if not token:
        return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

    secret = getattr(settings, "JWT_SECRET", None) or settings.SECRET_KEY
    if pyjwt is None or not hasattr(pyjwt, "decode"):
        return Response({
            "detail": "JWT library not available. Ensure PyJWT is installed and conflicting 'jwt' package is uninstalled."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        payload = pyjwt.decode(token, secret, algorithms=["HS256"])
    except Exception as e:
        return Response({"detail": f"Invalid token: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

    user_id = payload.get("sub")
    user = None
    try:
        user = User.objects(id=user_id).first()
    except Exception:
        user = None
    if not user:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data or {}
    name = (data.get("name") or "").strip()
    slug = (data.get("slug") or "").strip().lower() or name.lower().replace(" ", "-")
    if not name:
        return Response({"detail": "Store name is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure slug uniqueness
    if Store.objects(slug=slug).first():
        return Response({"detail": "Slug already exists"}, status=status.HTTP_409_CONFLICT)

    try:
        # Build store fields from payload
        store = Store(
            owner=user,
            name=name,
            slug=slug,
            store_type=data.get("store_type") or None,
            email=data.get("email") or None,
            phone=data.get("phone") or None,
            quote=data.get("quote") or None,
            description=data.get("description") or None,
            navbar_enabled=bool(data.get("navbar_enabled", True)),
            logo_position=(data.get("logo_position") or "left"),
        )
        # Handle optional logo upload (multipart/form-data)
        try:
            logo_file = request.FILES.get("logo")
        except Exception:
            logo_file = None
        if logo_file:
            logos_dir = os.path.join(settings.MEDIA_ROOT, "logos")
            os.makedirs(logos_dir, exist_ok=True)
            # Use slug for filename to keep it deterministic
            _, ext = os.path.splitext(logo_file.name)
            filename = f"{slug}{ext or ''}"
            storage = FileSystemStorage(location=logos_dir, base_url=settings.MEDIA_URL + "logos/")
            saved_name = storage.save(filename, logo_file)
            try:
                store.logo_url = request.build_absolute_uri(storage.url(saved_name))
            except Exception:
                store.logo_url = storage.url(saved_name)
            alt = data.get("logo_alt") or None
            if alt:
                store.logo_alt = alt

        store.save()
        # Update user's stores mapping
        stores_map = user.stores or {}
        stores_map[name] = str(store.id)
        user.stores = stores_map
        user.save()
        return Response({
            "id": str(store.id),
            "name": store.name,
            "slug": store.slug,
            "store_type": store.store_type,
            "email": store.email,
            "phone": store.phone,
            "quote": store.quote,
            "description": store.description,
            "navbar_enabled": store.navbar_enabled,
            "logo_position": store.logo_position,
            "logo_url": store.logo_url,
            "logo_alt": store.logo_alt,
            "userStores": user.stores,
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"detail": f"Failed to create store: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def my_projects(request):
    token = request.COOKIES.get("access_token")
    if not token:
        return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

    secret = getattr(settings, "JWT_SECRET", None) or settings.SECRET_KEY
    if pyjwt is None or not hasattr(pyjwt, "decode"):
        return Response({
            "detail": "JWT library not available. Ensure PyJWT is installed and conflicting 'jwt' package is uninstalled."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        payload = pyjwt.decode(token, secret, algorithms=["HS256"])
    except Exception as e:
        return Response({"detail": f"Invalid token: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

    user_id = payload.get("sub")
    user = None
    try:
        user = User.objects(id=user_id).first()
    except Exception:
        user = None

    if not user:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    projects = Project.objects(owner=user).order_by("-created_at")
    data = ProjectSerializer(projects, many=True).data
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
def store_by_slug(_request, slug: str):
    store = Store.objects(slug=slug).first()
    if not store:
        return Response({"detail": "Store not found"}, status=status.HTTP_404_NOT_FOUND)
    data = StoreSerializer(store).data
    owner = store.owner
    data["owner_info"] = {
        "id": str(owner.id) if owner else None,
        "name": owner.name if owner else None,
        "email": owner.email if owner else None,
        "phone": owner.phone if owner else None,
    }
    return Response(data, status=status.HTTP_200_OK)


@api_view(["POST"])
def create_product(request):
    token = request.COOKIES.get("access_token")
    if not token:
        return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

    secret = getattr(settings, "JWT_SECRET", None) or settings.SECRET_KEY
    if pyjwt is None or not hasattr(pyjwt, "decode"):
        return Response({
            "detail": "JWT library not available. Ensure PyJWT is installed and conflicting 'jwt' package is uninstalled."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        payload = pyjwt.decode(token, secret, algorithms=["HS256"])
    except Exception as e:
        return Response({"detail": f"Invalid token: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

    user = User.objects(id=payload.get("sub")).first()
    if not user:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data or {}
    store_id = data.get("store_id")
    store = None
    if store_id:
        store = Store.objects(id=store_id).first()
    if not store and data.get("slug"):
        store = Store.objects(slug=data.get("slug")).first()
    if not store:
        return Response({"detail": "Store not found"}, status=status.HTTP_404_NOT_FOUND)

    name = (data.get("name") or "").strip()
    if not name:
        return Response({"detail": "Product name is required"}, status=status.HTTP_400_BAD_REQUEST)

    images = []
    image_alts = []
    try:
        files = request.FILES.getlist("images")
        for f in files:
            imgs_dir = os.path.join(settings.MEDIA_ROOT, "products")
            os.makedirs(imgs_dir, exist_ok=True)
            _, ext = os.path.splitext(f.name)
            filename = f"{store.slug}-{name.replace(' ', '-')}-{datetime.now().timestamp()}{ext or ''}"
            storage = FileSystemStorage(location=imgs_dir, base_url=settings.MEDIA_URL + "products/")
            saved_name = storage.save(filename, f)
            try:
                images.append(request.build_absolute_uri(storage.url(saved_name)))
            except Exception:
                images.append(storage.url(saved_name))
    except Exception:
        pass
    if isinstance(data.get("image_alts"), list):
        image_alts = data.get("image_alts")

    try:
        product = Product(
            store=store,
            owner=user,
            name=name,
            description=data.get("description") or None,
            images=images,
            image_alts=image_alts,
            old_price=data.get("old_price") or None,
            current_price=data.get("current_price") or None,
        )
        product.save()
        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"detail": f"Failed to create product: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def products_by_slug(_request, slug: str):
    store = Store.objects(slug=slug).first()
    if not store:
        return Response({"detail": "Store not found"}, status=status.HTTP_404_NOT_FOUND)
    products = Product.objects(store=store).order_by("-created_at")
    return Response(ProductSerializer(products, many=True).data, status=status.HTTP_200_OK)


@api_view(["PATCH", "PUT"])
def update_product(request, pid: str):
    product = Product.objects(id=pid).first()
    if not product:
        return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    token = request.COOKIES.get("access_token")
    if not token:
        return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
    secret = getattr(settings, "JWT_SECRET", None) or settings.SECRET_KEY
    try:
        payload = pyjwt.decode(token, secret, algorithms=["HS256"])
    except Exception as e:
        return Response({"detail": f"Invalid token: {e}"}, status=status.HTTP_401_UNAUTHORIZED)
    if str(product.owner.id) != payload.get("sub"):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    data = request.data or {}
    for field in ("name", "description"):
        val = data.get(field)
        if val is not None:
            setattr(product, field, val)
    for field in ("old_price", "current_price"):
        if field in data:
            setattr(product, field, data.get(field) or None)

    try:
        files = request.FILES.getlist("images")
        if files:
            imgs_dir = os.path.join(settings.MEDIA_ROOT, "products")
            os.makedirs(imgs_dir, exist_ok=True)
            storage = FileSystemStorage(location=imgs_dir, base_url=settings.MEDIA_URL + "products/")
            for f in files:
                _, ext = os.path.splitext(f.name)
                filename = f"{product.store.slug}-{product.name.replace(' ', '-')}-{datetime.now().timestamp()}{ext or ''}"
                saved_name = storage.save(filename, f)
                try:
                    product.images.append(request.build_absolute_uri(storage.url(saved_name)))
                except Exception:
                    product.images.append(storage.url(saved_name))
    except Exception:
        pass
    if isinstance(data.get("image_alts"), list):
        product.image_alts = data.get("image_alts")

    product.save()
    return Response(ProductSerializer(product).data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def buy_product(_request, pid: str):
    product = Product.objects(id=pid).first()
    if not product:
        return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
    product.orders_count = int(product.orders_count or 0) + 1
    product.save()
    try:
        total = product.current_price or 0
        Order(store=product.store, total=total).save()
    except Exception:
        pass
    return Response({"orders_count": product.orders_count}, status=status.HTTP_200_OK)


@api_view(["GET"])
def dashboard_summary(request):
    token = request.COOKIES.get("access_token")
    if not token:
        return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

    secret = getattr(settings, "JWT_SECRET", None) or settings.SECRET_KEY
    try:
        payload = pyjwt.decode(token, secret, algorithms=["HS256"])
    except Exception as e:
        return Response({"detail": f"Invalid token: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

    user = User.objects(id=payload.get("sub")).first()
    if not user:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    store_ids = list((user.stores or {}).values())
    total_stores = len(store_ids)
    total_products = 0
    total_orders = 0
    total_revenue = 0
    for sid in store_ids:
        try:
            sdoc = Store.objects(id=sid).first()
            if not sdoc:
                continue
            prods = Product.objects(store=sdoc)
            total_products += prods.count()
            for p in prods:
                total_orders += int(p.orders_count or 0)
                try:
                    total_revenue += float(p.current_price or 0) * int(p.orders_count or 0)
                except Exception:
                    continue
        except Exception:
            continue

    return Response({
        "totalStores": total_stores,
        "totalProducts": total_products,
        "totalOrders": total_orders,
        "totalRevenue": total_revenue,
    }, status=status.HTTP_200_OK)


@api_view(["GET"])
def dashboard_breakdown(request):
    token = request.COOKIES.get("access_token")
    if not token:
        return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

    secret = getattr(settings, "JWT_SECRET", None) or settings.SECRET_KEY
    try:
        payload = pyjwt.decode(token, secret, algorithms=["HS256"])
    except Exception as e:
        return Response({"detail": f"Invalid token: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

    user = User.objects(id=payload.get("sub")).first()
    if not user:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    store_ids = list((user.stores or {}).values())
    breakdown = []
    for sid in store_ids:
        try:
            sdoc = Store.objects(id=sid).first()
            if not sdoc:
                continue
            prods = Product.objects(store=sdoc)
            products_count = prods.count()
            orders_count = 0
            for p in prods:
                try:
                    orders_count += int(p.orders_count or 0)
                except Exception:
                    continue
            breakdown.append({
                "id": str(sdoc.id),
                "name": sdoc.name,
                "slug": sdoc.slug,
                "products": products_count,
                "orders": orders_count,
            })
        except Exception:
            continue

    return Response(breakdown, status=status.HTTP_200_OK)


@api_view(["PATCH", "PUT"])
def update_me(request):
    token = request.COOKIES.get("access_token")
    if not token:
        return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

    secret = getattr(settings, "JWT_SECRET", None) or settings.SECRET_KEY
    try:
        payload = pyjwt.decode(token, secret, algorithms=["HS256"])
    except Exception as e:
        return Response({"detail": f"Invalid token: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

    user = User.objects(id=payload.get("sub")).first()
    if not user:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data or {}
    for field in ("name", "first_name", "last_name", "phone", "plan"):
        if field in data:
            setattr(user, field, data.get(field) or None)
    user.save()

    # Return same shape as /auth/me for consistency
    name = user.name or f"{user.first_name or ''} {user.last_name or ''}".strip()
    stores_slugs = {}
    try:
        for sname, sid in (user.stores or {}).items():
            sdoc = Store.objects(id=sid).first()
            if sdoc:
                stores_slugs[sname] = sdoc.slug
    except Exception:
        stores_slugs = {}
    return Response({
        "id": str(user.id),
        "email": user.email,
        "role": user.role or "client",
        "name": name,
        "plan": user.plan or "none",
        "stores": user.stores or {},
        "stores_slugs": stores_slugs,
    }, status=status.HTTP_200_OK)


@api_view(["PATCH", "PUT"])
def update_store(request, sid: str):
    token = request.COOKIES.get("access_token")
    if not token:
        return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
    secret = getattr(settings, "JWT_SECRET", None) or settings.SECRET_KEY
    try:
        payload = pyjwt.decode(token, secret, algorithms=["HS256"])
    except Exception as e:
        return Response({"detail": f"Invalid token: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

    store = Store.objects(id=sid).first()
    if not store:
        return Response({"detail": "Store not found"}, status=status.HTTP_404_NOT_FOUND)
    if not store.owner or str(store.owner.id) != payload.get("sub"):
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    data = request.data or {}
    for field in ("name", "quote", "description", "navbar_enabled", "logo_position"):
        if field in data:
            setattr(store, field, data.get(field))

    try:
        logo_file = request.FILES.get("logo")
    except Exception:
        logo_file = None
    if logo_file:
        logos_dir = os.path.join(settings.MEDIA_ROOT, "logos")
        os.makedirs(logos_dir, exist_ok=True)
        _, ext = os.path.splitext(logo_file.name)
        filename = f"{store.slug}{ext or ''}"
        storage = FileSystemStorage(location=logos_dir, base_url=settings.MEDIA_URL + "logos/")
        saved_name = storage.save(filename, logo_file)
        try:
            store.logo_url = request.build_absolute_uri(storage.url(saved_name))
        except Exception:
            store.logo_url = storage.url(saved_name)
    alt = data.get("logo_alt")
    if alt is not None:
        store.logo_alt = alt or None

    store.save()
    data = StoreSerializer(store).data
    return Response(data, status=status.HTTP_200_OK)
