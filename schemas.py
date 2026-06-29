from pydantic import BaseModel
from typing import Optional, List

class PlantBase(BaseModel):
    nursery_id: Optional[int] = None
    user_id: Optional[int] = None
    quantity: int = 1
    name: str
    scientific_name: str
    age: Optional[str] = None
    price: float
    rating: Optional[float] = None
    image_url: str
    description: Optional[str] = None
    climate: Optional[str] = None
    is_indoor: Optional[bool] = True
    soil_type: Optional[str] = None
    extra_images: Optional[str] = None

class PlantCreate(PlantBase):
    pass

class Plant(PlantBase):
    id: int

    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class GenerateDetailsRequest(BaseModel):
    plant_name: str

from datetime import date, datetime

class UserBase(BaseModel):
    name: str
    username: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    dob: Optional[date] = None
    age: Optional[int] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    dob: Optional[date] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_admin: bool

    class Config:
        from_attributes = True

class NurseryBase(BaseModel):
    nursery_name: str
    username: str
    email: Optional[str] = None
    phone_number: Optional[str] = None

class NurseryCreate(NurseryBase):
    password: str

class NurseryLogin(BaseModel):
    username: str
    password: str

class Nursery(NurseryBase):
    id: int
    role: str = "nursery"

    class Config:
        from_attributes = True

class CartItemCreate(BaseModel):
    user_id: int
    plant_id: int
    quantity: int = 1

class CartItemResponse(BaseModel):
    id: int
    user_id: int
    plant_id: int
    quantity: int
    plant: Plant

    class Config:
        from_attributes = True

class OrderItemResponse(BaseModel):
    id: int
    plant_id: int
    quantity: int
    price: float
    plant: Plant

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    nursery_id: Optional[int] = None
    seller_id: Optional[int] = None
    total_amount: float
    status: str
    pickup_date: Optional[date] = None
    pickup_time: Optional[str] = None
    delivery_type: Optional[str] = None
    created_at: datetime
    items: list[OrderItemResponse]

    class Config:
        from_attributes = True

class CheckoutRequest(BaseModel):
    delivery_type: str
    pickup_date: Optional[date] = None
    pickup_time: Optional[str] = None
