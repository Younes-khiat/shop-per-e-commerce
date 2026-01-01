from datetime import datetime
from mongoengine import (
    Document,
    EmbeddedDocument,
    StringField,
    DateTimeField,
    ReferenceField,
    DecimalField,
    EmailField,
    MapField,
    ListField,
    EmbeddedDocumentField,
    BooleanField,
)
from mongoengine import (
    Document,
    StringField,
    DateTimeField,
    ReferenceField,
    DecimalField,
    EmailField,
    MapField,
    BooleanField,
    ListField,
    IntField,
)


class User(Document):
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    name = StringField()
    first_name = StringField()
    last_name = StringField()
    phone = StringField()
    role = StringField(default="client")
    plan = StringField(default="free")
    stores = MapField(StringField())  # {storeName: storeId}
    created_at = DateTimeField(default=datetime.utcnow)

    def __str__(self):
        return self.email


class Project(Document):
    owner = ReferenceField(User, reverse_delete_rule=2)  # CASCADE on user deletion
    name = StringField(required=True, max_length=200)
    created_at = DateTimeField(default=datetime.utcnow)

    def __str__(self):
        return self.name


class Store(Document):
    project = ReferenceField(Project, reverse_delete_rule=2)  # CASCADE
    owner = ReferenceField(User, reverse_delete_rule=2)
    name = StringField(required=True, max_length=200)
    slug = StringField(required=True, unique=True)
    # General info
    store_type = StringField()
    email = EmailField()
    phone = StringField()
    quote = StringField()
    description = StringField()
    # Navbar / Sidebar configuration
    navbar_enabled = BooleanField(default=True)
    logo_position = StringField(choices=("left", "center", "right", "none"), default="left")
    # Logo assets
    logo_url = StringField()
    logo_alt = StringField()
        # nav_items removed as part of the patch
    created_at = DateTimeField(default=datetime.utcnow)

    def __str__(self):
        return self.name


class Order(Document):
    store = ReferenceField(Store, reverse_delete_rule=2)  # CASCADE
    total = DecimalField(precision=2, force_string=True)
    created_at = DateTimeField(default=datetime.utcnow)

    def __str__(self):
        return f"Order #{str(self.id)} - {self.total}"


class NavItem(EmbeddedDocument):
    name = StringField()
    link = StringField()
    description = StringField()


class Product(Document):
    store = ReferenceField(Store, reverse_delete_rule=2)
    owner = ReferenceField(User, reverse_delete_rule=2)
    name = StringField(required=True, max_length=200)
    description = StringField()
    images = ListField(StringField())
    image_alts = ListField(StringField())
    old_price = DecimalField(precision=2, force_string=True)
    current_price = DecimalField(precision=2, force_string=True)
    orders_count = IntField(default=0)
    created_at = DateTimeField(default=datetime.utcnow)

    def __str__(self):
        return self.name
