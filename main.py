import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from groq import Groq
import models.models as models
from database import engine, get_db, SessionLocal
import schemas
from datetime import date

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Saplinggo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()

# Groq Setup
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)

@app.post("/api/plants", response_model=schemas.Plant)
def create_plant(plant: schemas.PlantCreate, db: Session = Depends(get_db)):
    db_plant = models.Plant(**plant.model_dump())
    db.add(db_plant)
    db.commit()
    db.refresh(db_plant)
    return db_plant

@app.get("/api/plants", response_model=List[schemas.Plant])
def read_plants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    plants = db.query(models.Plant).offset(skip).limit(limit).all()
    return plants

@app.get("/api/plants/{plant_id}", response_model=schemas.Plant)
def read_plant(plant_id: int, db: Session = Depends(get_db)):
    plant = db.query(models.Plant).filter(models.Plant.id == plant_id).first()
    if plant is None:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant

@app.post("/api/chat")
def chat_with_agent(request: schemas.ChatRequest):
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        return {"response": "Groq API Key not configured. Please set GROQ_API_KEY in .env"}
    
    system_prompt = """
    You are an expert botanist and nursery assistant for the Saplinggo e-commerce platform.
    Your role is to help users with plant maintenance, provide insights on how to nurture them, and answer plant-related doubts.
    Your replies MUST be highly accurate and facts-based. DO NOT fabricate information.
    Your conversation MUST strictly be based on plants and the nursery theme.
    If a user asks about ANYTHING else (e.g., coding, politics, general knowledge, other e-commerce items), you MUST reply exactly with:
    "This is out of the scope of my discussion. Let's talk about plants."
    Do not add extra pleasantries when rejecting out-of-scope requests.
    Keep your answers friendly, engaging, and suitable for a nursery vibe.
    Format your responses as natural, descriptive text. Do not generate tables unless absolutely necessary (like comparing multiple items side-by-side) or explicitly requested.
    """

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            model="openai/gpt-oss-120b",
            temperature=0.2,
            max_tokens=1024,
        )
        return {"response": chat_completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-details")
def generate_details(request: schemas.GenerateDetailsRequest):
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        raise HTTPException(status_code=500, detail="Groq API Key not configured")
    
    system_prompt = """
    You are an expert botanist API. The user will provide a plant name.
    You must return a raw JSON object with the following keys and accurate details:
    - "scientific_name": (string)
    - "climate": (string, exactly one of "Tropical", "Temperate", or "Arid")
    - "is_indoor": (boolean, true if it's generally an indoor houseplant, false otherwise)
    - "soil_type": (string)
    - "description": (string, 1-2 sentences)
    Output ONLY the JSON object. Do not include markdown formatting or extra text.
    """

    try:
        import json
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.plant_name}
            ],
            model="openai/gpt-oss-120b",
            temperature=0.1,
            max_tokens=500,
        )
        content = chat_completion.choices[0].message.content
        content = content.replace("```json", "").replace("```", "").strip()
        return json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        or_(models.User.username == user.username, models.User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    calculated_age = None
    if user.dob:
        today = date.today()
        calculated_age = today.year - user.dob.year - ((today.month, today.day) < (user.dob.month, user.dob.day))
    
    new_user = models.User(
        name=user.name,
        username=user.username,
        email=user.email,
        phone_number=user.phone_number,
        dob=user.dob,
        age=calculated_age,
        password=user.password,
        is_admin=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/login", response_model=schemas.User)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        or_(models.User.username == user.username, models.User.email == user.username),
        models.User.password == user.password
    ).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return db_user

from pydantic import BaseModel
class ForgotPasswordRequest(BaseModel):
    email: str

@app.post("/api/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == req.email).first()
    if not db_user:
        # We can just return success to avoid leaking emails
        return {"message": "If an account with that email exists, a password reset link has been sent."}
    # In a real app, generate token and send email
    return {"message": "If an account with that email exists, a password reset link has been sent."}

@app.get("/api/users", response_model=List[schemas.User])
def read_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.username == 'azhar' or user.username == 'azhar2006':
        raise HTTPException(status_code=403, detail="Cannot delete super admin")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@app.put("/api/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.name is not None:
        user.name = user_update.name
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.phone_number is not None:
        user.phone_number = user_update.phone_number
    if user_update.dob is not None:
        user.dob = user_update.dob
        today = date.today()
        user.age = today.year - user.dob.year - ((today.month, today.day) < (user.dob.month, user.dob.day))
        
    db.commit()
    db.refresh(user)
    return user

@app.put("/api/users/{user_id}/admin", response_model=schemas.User)
def make_admin(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = True
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/cart", response_model=schemas.CartItemResponse)
def add_to_cart(item: schemas.CartItemCreate, db: Session = Depends(get_db)):
    db_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == item.user_id,
        models.CartItem.plant_id == item.plant_id
    ).first()
    
    if db_item:
        db_item.quantity += item.quantity
        db.commit()
        db.refresh(db_item)
        return db_item
    else:
        new_item = models.CartItem(**item.model_dump())
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item

@app.get("/api/cart/{user_id}", response_model=List[schemas.CartItemResponse])
def get_cart(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.CartItem).filter(models.CartItem.user_id == user_id).all()

@app.delete("/api/cart/{item_id}")
def remove_from_cart(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.CartItem).filter(models.CartItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item removed"}

@app.post("/api/checkout/{user_id}", response_model=schemas.OrderResponse)
def checkout_cart(user_id: int, db: Session = Depends(get_db)):
    cart_items = db.query(models.CartItem).filter(models.CartItem.user_id == user_id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
        
    total_amount = sum([item.quantity * item.plant.price for item in cart_items])
    
    new_order = models.Order(user_id=user_id, total_amount=total_amount)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    for item in cart_items:
        order_item = models.OrderItem(
            order_id=new_order.id,
            plant_id=item.plant_id,
            quantity=item.quantity,
            price=item.plant.price
        )
        db.add(order_item)
    
    db.query(models.CartItem).filter(models.CartItem.user_id == user_id).delete()
    db.commit()
    db.refresh(new_order)
    return new_order

@app.get("/api/orders/{user_id}", response_model=List[schemas.OrderResponse])
def get_orders(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(models.Order).filter(models.Order.user_id == user_id).order_by(models.Order.created_at.desc()).all()
    return orders

@app.get("/api/seed")
def seed_db(db: Session = Depends(get_db)):
    if db.query(models.User).count() == 0:
        db.add(models.User(name="Azhar", username="azhar", password="Azba@2001", is_admin=True))
        db.add(models.User(name="Azhar 2006", username="azhar2006", password="Azba@2001", is_admin=True))
        db.commit()

    # Clear existing data if there are less than 15 plants, and reseed
    if db.query(models.Plant).count() < 15:
        db.query(models.Plant).delete()
        samples = [
            models.Plant(name="Monstera Deliciosa", scientific_name="Monstera deliciosa", age="1 year", price=45.0, rating=4.8, image_url="https://imgs.search.brave.com/LbHYx8Fu1hp2nnHodmjb8eU1AySm5_aFfyxQlZpOREk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/dGhlc3BydWNlLmNv/bS90aG1iL2lEMXZV/ck4tN25PbW9hVDl0/a2V6eXpydkdKcz0v/MTUwMHgwL2ZpbHRl/cnM6bm9fdXBzY2Fs/ZSgpOm1heF9ieXRl/cygxNTAwMDApOnN0/cmlwX2ljYygpOmZv/cm1hdCh3ZWJwKS9o/b3ctdG8tZ3Jvdy1t/b25zdGVyYS1kZWxp/Y2lvc2EtNTA3MjY3/MS0wNC05YTIyOTcz/ZTY2MmY0YmE4ODJl/ZWY1ZjE2ZDQwYmNj/OS5qcGc", description="A popular houseplant with striking, holey leaves. Needs bright, indirect light.", climate="Tropical", is_indoor=True, soil_type="Peat-based potting soil", extra_images="https://imgs.search.brave.com/nWcn2SHdQef_-ZMWP-eFBDm-oWsJqmlvmx_soY8fYyU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9oZWFy/dGhhbmR2aW5lLmNv/bS93cC1jb250ZW50/L3VwbG9hZHMvMjAx/OC8wNi9pbmRvb3It/Z2FyZGVuaW5nLW1v/bnN0ZXJhLWRlbGlj/aW9zYS1saWdodGVk/LmpwZw,https://imgs.search.brave.com/AXTzZPMbdxC2RS3UUASJ2cTeYIbRR0xVaEI1I6DotTQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTIw/Mjc1NzQ2My9waG90/by9tb25zdGVyYS1k/ZWxpY2lvc2EtaG91/c2VwbGFudC1pbi1i/cmlnaHQtc3VubGln/aHQuanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPWVIRUFZVkg2/T1VkdUdLbllwSGp4/M2VudERJOXJielFS/NXpfckNQR1BsQk09"),
            models.Plant(name="Snake Plant", scientific_name="Sansevieria trifasciata", age="2 years", price=25.0, rating=4.9, image_url="https://imgs.search.brave.com/cedJN9bWyCoikwW8K4AljKR7oYtzvU97djM4CMvEtDk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMjE3/Nzc5ODU0MC9waG90/by9hLXNuYWtlLXBs/YW50LWRyYWNhZW5h/LXRyaWZhc2NpYXRh/LWluLWEtcG90LW9u/LXRoZS1zdGFpcnMt/aW4tYS1kb21lc3Rp/Yy1ob21lLXdpdGgt/YnJpZ2h0LmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz0welIw/ZUFvY3l2aWRUWGJ4/THhGcWF2S0pvNXQw/dmQwRmdBdGRLWjA5/TE1rPQ", description="Extremely hardy and low maintenance. Great for beginners.", climate="Arid", is_indoor=True, soil_type="Sandy, well-draining soil", extra_images="https://imgs.search.brave.com/FwaIj1h3J02wQU8A-BhSVynpmf2_gVv-lFCdE6uvMIQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9nYXJk/ZW5lcnNwYXRoLmNv/bS93cC1jb250ZW50/L3VwbG9hZHMvMjAy/Mi8wOS9TbmFrZS1Q/bGFudC1Hcm93aW5n/LWFzLWEtSG91c2Vw/bGFudC5qcGc,https://imgs.search.brave.com/IEI6WmgWf6BmCGd30P98pbBvcUAt8xyOIraoHjTC7JQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTEv/OTYyLzg4MS9zbWFs/bC9zbmFrZS1wbGFu/dC1ncm93aW5nLXRh/bGwtaW4tbW9kZXJu/LWhvbWUtZGVjb3It/c2V0dGluZy1waG90/by5qcGc"),
            models.Plant(name="Fiddle Leaf Fig", scientific_name="Ficus lyrata", age="3 years", price=65.0, rating=4.5, image_url="https://imgs.search.brave.com/3Zy_9QLMBkuWrsDKxA-6lCjtge-upzouaCG11NC61xo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTA4/NjU5NDI4Mi9waG90/by9maWRkbGUtbGVh/Zi1maWctdHJlZS13/aXRoLWxpZ2h0aW5n/LWFuZC1zaGFkb3cu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PTUyUDlqaWcyY0ZU/UjJUQVhPcGZOY2JX/VDVwVlYzNzN4dXp1/XzY4cnpmdzA9", description="Features very large, heavily veined, and violin-shaped leaves.", climate="Tropical", is_indoor=True, soil_type="Rich, well-drained soil", extra_images="https://imgs.search.brave.com/ronAckV2i2czWN5NeuohEB21bL-Qg7NujHQsiRK6NnA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9iMjk0/NTA0MS5zbXVzaGNk/bi5jb20vMjk0NTA0/MS93cC1jb250ZW50/L3VwbG9hZHMvMjAy/MC8wOC9XaGl0ZS1T/cG90cy1GaWRkbGUt/TGVhZi1GaWctTGVh/dmVzLTMwMHgzMDAt/MS5qcGc_bG9zc3k9/MSZzdHJpcD0xJndl/YnA9MQ,https://imgs.search.brave.com/N0Tfms9X12PbBj5m3VXiV5j1eBNzacE0AVW64MMxgOw/rs:fit:0:180:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuY3RmYXNzZXRz/Lm5ldC9pM3RrZzdk/dDNrcm8vNWV3SUY4/d2RoSnVJWnREYjN5/REVEby83N2U2MGFh/YjQ3NTcwOGFkZDUx/M2M5ZWU1MmM3YzQw/OC9maWRkbGUtbGVh/Zi1maWctY2FyZS1o/ZXJvLTEuanBnP3c9/MTkyMCZmbT13ZWJw/JnE9NzA"),
            models.Plant(name="Peace Lily", scientific_name="Spathiphyllum", age="6 months", price=20.0, rating=4.7, image_url="https://imgs.search.brave.com/Bj2zTQcX23qc1Xf8lDSII42et0p7webH4nxqoLgKPRU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/bmF0dXJlbnVyc2Vy/eS5pbi93cC1jb250/ZW50L3VwbG9hZHMv/MjAyMC8wNC9QZWFj/ZS1MaWx5LVNwYXRo/aXBoeWxsdW0uanBn", description="Beautiful white blooms and excellent air purifying qualities.", climate="Tropical", is_indoor=True, soil_type="Moist, well-draining soil", extra_images="https://imgs.search.brave.com/mCFPzkOcz278UZllVDYBLAGv5ceXjl0SHVrwHuMYBuQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTM5/MzYwNTA2NC9waG90/by9zcGF0aGlwaHls/bHVtLW9yLXBlYWNl/LWxpbHktaG91c2Vw/bGFudC1vbi10aGUt/d2luZG93LXNpbGwu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PVlVdERyNlNDaVdP/MzZyV0tKTGdnNWlt/S29Wd3pjZTFNYVMy/V01RNERBNjA9,https://imgs.search.brave.com/z7Bgdk2vPn-CJltojpMk-N5R0pWN9Ov1CgLfAmaX17s/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/YWxtYW5hYy5jb20v/c2l0ZXMvZGVmYXVs/dC9maWxlcy91c2Vy/cy9UaGUlMjBFZGl0/b3JzL3BlYWNlLWxp/bHlfaXp6enktZ2V0/dHlfZnVsbF93aWR0/aC5qcGc"),
            models.Plant(name="Aloe Vera", scientific_name="Aloe barbadensis miller", age="1 year", price=15.0, rating=4.6, image_url="https://imgs.search.brave.com/iVKkCSU4q67B9L-iBefq4byr7lEnudjpsoQV15fCaYE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9ncmVl/bnRva3JpLmNvbS9j/ZG4vc2hvcC9maWxl/cy9BbG9lX1ZlcmFf/cGxhbnRfd2l0aF93/YXRlcl9kcm9wbGV0/c18tX1N0b2NrcGhv/dG8uanBnP3Y9MTcz/ODY1OTgwNSZ3aWR0/aD0xNDQ1", description="A succulent plant species with soothing gel inside its leaves.", climate="Arid", is_indoor=True, soil_type="Cactus and succulent mix", extra_images="https://imgs.search.brave.com/PfdtMYtY9ewWGGGam7Q4qejUzw0-8hc-2v6ylCIRk6E/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAwLzg4LzM1Lzk0/LzM2MF9GXzg4MzU5/NDI3XzRKblpDRUpH/M2R5ZjBhQllWZ083/ZVFBa1JNc25wRFRq/LmpwZw,https://imgs.search.brave.com/DLOYcd46GpmdgwT0mX6alpToOxDvbQCA7sJaNT3Bicg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAxLzk3Lzc4LzI2/LzM2MF9GXzE5Nzc4/MjYwN184TTdMeVlQ/cFNzQXFwbDZSVXFa/ZldhTjQ0dkxCRXBz/RC5qcGc"),
            models.Plant(name="ZZ Plant", scientific_name="Zamioculcas zamiifolia", age="1.5 years", price=35.0, rating=4.9, image_url="https://imgs.search.brave.com/GhICQs1wkrxRUnHMND01bI-8_rELxiL_vqePkRpYN3s/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/dGhlc2lsbC5jb20v/Y2RuL3Nob3AvZmls/ZXMvVGhlLVNpbGxf/TGFyZ2UtWlotUGxh/bnRfTW9kZXJuaWNh/X1BsYW50ZXJfZ2Fs/bGVyeV9hbGxfYWxs/XzAxLmpwZz92PTE3/NzI0ODE3MTImd2lk/dGg9MTQ0NQ", description="Tolerates neglect, is drought tolerant, and accepts low-light conditions.", climate="Tropical", is_indoor=True, soil_type="Standard potting mix with perlite", extra_images="https://imgs.search.brave.com/VvCnmK1_IkKAmryiT2t8GneeQKGuP_2wIXWKUxS7mZE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/b3VyaG91c2VwbGFu/dHMuY29tL2ltZ3Mt/Y29udGVudC9aWi1a/ZW56aS1wbGFudC5q/cGc,https://imgs.search.brave.com/pa_gJwt6gA05V2AzbpDKDKFYqCaJqs9ODzuiH2TqeX4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNzUv/MDI5LzI4MC9zbWFs/bC92aWJyYW50LWdy/ZWVuLXp6LXBsYW50/LW9uLWEtd29vZGVu/LXBlZGVzdGFsLXBo/b3RvLmpwZw"),
            models.Plant(name="Spider Plant", scientific_name="Chlorophytum comosum", age="8 months", price=18.0, rating=4.4, image_url="https://imgs.search.brave.com/i0-zx8VREou9CDbEMhjrvFVKfrIJyw4lrgLsS-6X0Nw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/c2hvcGlmeS5jb20v/cy9maWxlcy8xLzA4/NTIvNjQ4Mi82NjY0/L2ZpbGVzL0Jsb29t/c2NhcGVfU3BpZGVy/LVBsYW50X0JfYzE2/N2MzYTktOTkzZS00/ZGExLTlmNTMtODJj/ZTUyNTAyMmE5Lmpw/Zz92PTE3NTk3Nzg3/NzA", description="Adaptable houseplant with long, grass-like leaves. Easy to propagate.", climate="Temperate", is_indoor=True, soil_type="Loamy, well-draining soil", extra_images="https://imgs.search.brave.com/LeqSCXwftTNrtNgJ7bYQwIyqd_TLdmeT_NXowOyxF-M/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9ydWtt/aW5pbTIuZmxpeGNh/cnQuY29tL2ltYWdl/LzYxMi82MTIveGlm/MHEvcGxhbnQtc2Fw/bGluZy9mL28vbS9h/bm51YWwtbm8teWVz/LXNwaWRlci1wbGFu/dC0xLXBsYXN0aWMt/YmFnLW5ldy1tb2Rl/cm4tZmFybS1vcmln/aW5hbC1pbWFnZ3pu/a2FwZHBqcW5hLmpw/ZWc_cT03MA,https://imgs.search.brave.com/TTOAva8T4m7d99pZfpeiiG82SGpHi520Bj40L2HV4NE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9zcGlkZXIt/cGxhbnQtdGhhdC1n/cm93LXdlbGwtMjYw/bnctMjQzNDIxMjY3/Ny5qcGc"),
            models.Plant(name="Pothos", scientific_name="Epipremnum aureum", age="1 year", price=22.0, rating=4.8, image_url="https://imgs.search.brave.com/WorZdXQeLHgschX4jm71dqHA0gv2ObC-H3rWLybdIa8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9wbGFu/dHVyYS5nYXJkZW4v/dWsvd3AtY29udGVu/dC91cGxvYWRzL3Np/dGVzLzIvMjAyMS8w/OS9wb3Rob3MtMTAy/NHg2ODMuanBnP3g1/NDMyNw", description="A trailing vine that is incredibly easy to care for and fast growing.", climate="Tropical", is_indoor=True, soil_type="Standard potting mix", extra_images="https://imgs.search.brave.com/0jw63JcCY6WjsZV5yVNpt0KjWe6eM0WwMFKeBpVEOEQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuY3RmYXNzZXRz/Lm5ldC9pM3RrZzdk/dDNrcm8vNDF0b0dr/MGJxNTBWSzZJSDV6/TGJReS9hNTRiOTg2/MmI3NTQ0ZWNkMTll/MzE0MGNiZmM4MTIz/My8wMi1uZW9uLXBv/dGhvcy1pbi13YXRl/ci5qcGc_dz0xOTIw/JmZtPXdlYnAmcT03/MA,https://imgs.search.brave.com/KPP4CtYyUsgSK1gVMB8Oe5AWnllPx-vroQNT5Owrh4k/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9ub3V2/ZWF1cmF3LmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAyMC8w/MS9Qb3Rob3MtR29s/ZGVuLVBvdGhvcy1Q/bGFudC04MDAtbWFp/bi5wbmc"),
            models.Plant(name="Rubber Plant", scientific_name="Ficus elastica", age="2 years", price=40.0, rating=4.6, image_url="https://imgs.search.brave.com/NbrptbqX1DvMkXviVF8zfXgk7OeooXZHj1RzjoRUhxM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNzQv/MDE1LzYwNy9zbWFs/bC9jbG9zZS11cC1v/Zi1hLXJ1YmJlci1w/bGFudC13aXRoLWRh/cmstYW5kLXJlZGRp/c2gtYnJvd24tbGVh/dmVzLWFnYWluc3Qt/YS10ZXh0dXJlZC13/YWxsLXNob3dpbmct/bmF0dXJhbC1pbmRv/b3ItYm90YW5pY2Fs/LWJlYXV0eS1waG90/by5qcGc", description="Characterized by thick, glossy, rubbery leaves. Makes a bold statement.", climate="Tropical", is_indoor=True, soil_type="Well-draining potting soil", extra_images="https://imgs.search.brave.com/lv7j5HAk-D3p0urLXZjdE8_ADDizWDrcw0QXSMPsQFQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/c2hvcGlmeS5jb20v/cy9maWxlcy8xLzA0/NzkvOTA4OS84ODU2/L2ZpbGVzL1J1YmJl/cl9QbGFudHNfLV9D/YXJlX1R5cGVfYW5k/X1Byb3BhZ2F0aW9u/XzFfNjAweDYwMC5q/cGc_dj0xNjYzMzU5/MzI2,https://imgs.search.brave.com/I1iXxG4Okmt3XGI8ALgqJtCeC-RUGEvc7qkbx68InEU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNzQv/MDE0Lzk0MS9zbWFs/bC9hLWJlYXV0aWZ1/bC1pbmRvb3ItZmlj/dXMtZWxhc3RpY2Et/cnViYmVyLXBsYW50/LXRocml2ZXMtd2l0/aC1kYXJrLWdyZWVu/LWxlYXZlcy1hbmQt/ZW1lcmdpbmctcmVk/ZGlzaC1uZXctZ3Jv/d3RoLW5lc3RsZWQt/aW4tYS1jaGFybWlu/Zy13b3Zlbi1wb3Qt/cGhvdG8uanBn"),
            models.Plant(name="Bird of Paradise", scientific_name="Strelitzia reginae", age="3 years", price=85.0, rating=4.7, image_url="https://imgs.search.brave.com/asNbMf5L0sPHyEz17MkewmNsbBt4tjXy-TIlHi-fLqM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvOTI2/OTE3NS9wZXhlbHMt/cGhvdG8tOTI2OTE3/NS5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdz01MDA", description="Tropical plant featuring large, banana-like leaves and spectacular flowers.", climate="Tropical", is_indoor=False, soil_type="Rich, well-draining soil", extra_images="https://imgs.search.brave.com/FaHsIRfppWUvRMMuOn9-MV8O22SWqHWSeryEh62TbX0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTQy/MzgwMTAvcGV4ZWxz/LXBob3RvLTE0MjM4/MDEwLmpwZWc_YXV0/bz1jb21wcmVzcyZj/cz10aW55c3JnYiZk/cHI9MSZ3PTUwMA,https://imgs.search.brave.com/JnhOY8nI7llumJ9pfhwSDcIZLmxiS2mWUaG47ktSGzs/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9iaXJk/LXBhcmFkaXNlLWZs/b3dlci0xMDgyMzA1/LmpwZw"),
            models.Plant(name="Philodendron", scientific_name="Philodendron hederaceum", age="1.5 years", price=28.0, rating=4.5, image_url="https://imgs.search.brave.com/1gdz81_NN94hkGw8_4woFZN3WJyel0Lhm3T-4KGWSws/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi91bmlx/dWUtbGVhZi1zaGFw/ZS1waGlsb2RlbmRy/b24tYmlwZW5uaWZv/bGl1bS1hdXJlYS1n/b2xkLXZpb2xpbi1p/bmRvb3ItdHJvcGlj/YWwtcGxhbnQtdW5p/cXVlLWxlYWYtc2hh/cGUtcGhpbG9kZW5k/cm9uLTIyMTA5MDU3/Ny5qcGc", description="Classic trailing plant with heart-shaped leaves. Perfect for shelves.", climate="Tropical", is_indoor=True, soil_type="Peat-based potting mix", extra_images="https://imgs.search.brave.com/rlAZTn5Oy2w3OWa1aZxplt9rTe6FSZ3j8HVJ_giBrLE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGV2/ZXNsZWF2ZXMuY29t/L2Nkbi9zaG9wL3By/b2R1Y3RzL2FyYWNl/YWUtcGhpbG9kZW5k/cm9uLWdpZ2FzLXN0/ZXZlX3NsZWF2ZXNf/aW5jLi0xLmpwZz92/PTE2NTQ4NjkxNzgm/d2lkdGg9MzIw,https://imgs.search.brave.com/9hbPZxsj8rATfjlQvVmY_vvMHMWeaLghOPgeqQ631JA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/Z2FyZGVuZGVzaWdu/LmNvbS9waWN0dXJl/cy9pbWFnZXMvMzIw/eDI0MEV4YWN0XzB4/MTYvc2l0ZV8zL29y/YW5nZS15b3UtZ29y/Z2VvdXMtcGhpbG9k/ZW5kcm9uLXBoaWxv/ZGVuZHJvbi1oeWJy/aWQtcHJvdmVuLXdp/bm5lcnNfMTg5NDIu/anBn"),
            models.Plant(name="Calathea", scientific_name="Calathea orbifolia", age="1 year", price=32.0, rating=4.3, image_url="https://imgs.search.brave.com/wGI_uKVPVH1aG_EV9Ba6E0AdoeewjYMbL35iof79YZA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/dWdhb28uY29tL2Nk/bi9zaG9wL3Byb2R1/Y3RzL0RTQ18xNDU4/LmpwZz92PTE2ODE1/NTE3OTImd2lkdGg9/MTAwMA", description="Stunning foliage with striking patterns. Requires high humidity.", climate="Tropical", is_indoor=True, soil_type="Moist, well-draining mix", extra_images="https://imgs.search.brave.com/798TJDD0bg_Uk9BY-mYc764JsSCPujQ7Ql5l1YVWJGo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9oaW1h/ZHJpYXF1YXRpY3Mu/Y29tL3dwLWNvbnRl/bnQvdXBsb2Fkcy8y/MDIzLzA3LzEwMDAw/MjgxMTQtMjY1eDI2/NS5qcGc,https://imgs.search.brave.com/qknaBh0C5_YEZEzk7InLOnoCT8BplqpjH_BhmopYDL4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NDFxT0ljZ3ptV0wu/anBn"),
            models.Plant(name="Jade Plant", scientific_name="Crassula ovata", age="4 years", price=26.0, rating=4.8, image_url="https://imgs.search.brave.com/5L6VVBc9_za5f2qKjN_xbeBDoOOvnj3K7DXIB4Ieii0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM3/MjE2MzY2NC9waG90/by9zdWNjdWxlbnQt/cGxhbnQuanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPUtVX2hn/eUVPeDV1U2ZtbHBK/VlF4MWI0MWhVb1ps/b1hGeGhFdTgteEFR/Xzg9", description="A popular succulent with fleshy, oval-shaped leaves. Symbolizes good luck.", climate="Arid", is_indoor=True, soil_type="Sandy, well-draining soil", extra_images="https://imgs.search.brave.com/YpMXorZW929jvc3c6bMUepmVUOsG1VomI_lYIMV1znU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/YmhnLmNvbS90aG1i/L3ptUkdiVEtBMHN3/WExYU044am1ScExt/YUVkUT0vMjgyeDE4/OC9maWx0ZXJzOm5v/X3Vwc2NhbGUoKTpt/YXhfYnl0ZXMoMTUw/MDAwKTpzdHJpcF9p/Y2MoKTpmb2NhbCg3/NDl4MDo3NTF4Mikv/amFkZS1mMmJhMjU4/NDExOTI0MGI3ODIy/YWJlZGYxZDNhNzUx/Ni5qcGc,https://imgs.search.brave.com/OJQGWQ99fdq1Hwq2ibYDeFQQgWZ7uFDkCuNmDQ2bj-Y/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9qYWRl/LXBsYW50LWNsb3Nl/dXAtdGVycmFjb3R0/YS1wb3QtMTU4NTgx/MzcyLmpwZw"),
            models.Plant(name="String of Pearls", scientific_name="Senecio rowleyanus", age="9 months", price=24.0, rating=4.5, image_url="https://imgs.search.brave.com/rZrBB1tS4SgR3BhuAlmJnvEVdNMKEPq6pOBvyVeu7Jg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NjFyMVc2bXJOMEwu/anBn", description="Unique trailing succulent with pea-shaped leaves. Excellent for hanging baskets.", climate="Arid", is_indoor=True, soil_type="Cactus and succulent mix", extra_images="https://imgs.search.brave.com/nlSWeIGFcJ9uxbzMVP4LJx41xwWwOiXYGd34mU2PTPk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9udXJz/ZXJ5bmlzYXJnYS5p/bi93cC1jb250ZW50/L3VwbG9hZHMvMjAy/MS8wNS9VbnRpdGxl/ZC1kZXNpZ24tMjAy/NS0xMi0yMlQxNjIz/MDYuMjgwLndlYnA,https://imgs.search.brave.com/SE3Pji-0Xp7XEIMzCmHlL2HrC6addCR11AIm4w53siY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NjF0d3hzbHBaVUwu/anBn"),
            models.Plant(name="Boston Fern", scientific_name="Nephrolepis exaltata", age="2 years", price=30.0, rating=4.6, image_url="https://imgs.search.brave.com/HEHNcpYs0sXg_dka5vfdmpNlRXvFng1rfAkYoyzFzQo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L3FH/WmNmQm5jQkpEZWtC/eXdWRHFXclAuanBn", description="Lush, feathery fronds that add a classic touch of green to any room.", climate="Tropical", is_indoor=True, soil_type="Rich, loamy, moist soil", extra_images="https://imgs.search.brave.com/tARRHeJ_Ti1VX-eZLPaaTgjfNokA_1zmiZyei0jUu68/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9teXBl/cmZlY3RwbGFudHMu/Y29tL2Nkbi9zaG9w/L3Byb2R1Y3RzL0Jv/c3RvbkZlcm5fd2Vi/c2l0ZTFfNDAweC5q/cGc_dj0xNzA3MTYz/ODE0,https://imgs.search.brave.com/dR1CxI3SHq6yQQgTSCJiTEbsaNrtdFn4myABDl0mF_U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzIwLzI0LzUxLzQ1/LzM2MF9GXzIwMjQ1/MTQ1NTZfMUt1S0pi/dEU1VWRiNGNNYmRD/SjVYMDF5dkNUazNB/bXouanBn")
        ]
        db.bulk_save_objects(samples)
        db.commit()
        return {"message": "Database seeded with 15 plants successfully."}
    return {"message": "Database already contains sufficient data."}
