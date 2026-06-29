import models.models as models
from database import engine, get_db, SessionLocal
from main import seed_db

db = SessionLocal()
db.query(models.OrderItem).delete()
db.query(models.Order).delete()
db.query(models.CartItem).delete()
db.query(models.Plant).delete()
db.commit()

seed_db(db)
print("Reseed complete.")
