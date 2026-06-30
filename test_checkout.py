import requests

url = "http://127.0.0.1:8003"
# Register user
res = requests.post(f"{url}/api/register", json={
    "name": "Test User",
    "username": "testuser",
    "password": "password",
    "email": "test@test.com"
})
user_id = res.json().get("id")
if not user_id:
    user_id = requests.post(f"{url}/api/login", json={"username": "testuser", "password": "password"}).json().get("id")

print("User ID:", user_id)

# Fetch plants
plants = requests.get(f"{url}/api/plants").json()
if not plants:
    print("No plants")
    exit()

plant_id = plants[0]["id"]
print("Plant ID:", plant_id)

# Add to cart
res = requests.post(f"{url}/api/cart", json={
    "user_id": user_id,
    "plant_id": plant_id,
    "quantity": 1
})
print("Cart add:", res.json())

# Checkout
res = requests.post(f"{url}/api/checkout/{user_id}", json={
    "delivery_type": "pickup",
    "pickup_date": "2026-06-30",
    "pickup_time": "14:00"
})
print("Checkout:", res.status_code, res.text)
