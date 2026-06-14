from sqlalchemy import Column, Integer, String, Float, Text, Boolean, Date, DateTime
from datetime import datetime
from database import Base

class Plant(Base):
    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    scientific_name = Column(String, nullable=False)
    age = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    rating = Column(Float, nullable=True)
    image_url = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    climate = Column(String, nullable=True)
    is_indoor = Column(Boolean, default=True)
    soil_type = Column(String, nullable=True)
    extra_images = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    phone_number = Column(String, nullable=True)
    dob = Column(Date, nullable=True)
    age = Column(Integer, nullable=True)
    password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)

from sqlalchemy.orm import relationship

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), index=True, nullable=False)
    plant_id = Column(Integer, ForeignKey('plants.id'), index=True, nullable=False)
    quantity = Column(Integer, default=1)
    
    plant = relationship("Plant")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), index=True, nullable=False)
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'), index=True, nullable=False)
    plant_id = Column(Integer, ForeignKey('plants.id'), index=True, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    plant = relationship("Plant")
