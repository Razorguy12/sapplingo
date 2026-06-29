from database import engine
from sqlalchemy import text

def run_migrations():
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE plants ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);"))
            print("Added user_id column.")
    except Exception as e:
        print("user_id already exists or error:", e)
        
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE plants ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;"))
            print("Added quantity column.")
    except Exception as e:
        print("quantity already exists or error:", e)

if __name__ == '__main__':
    run_migrations()
    
    # Add new order columns
    commands = [
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending';",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_date DATE;",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_time VARCHAR;",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR;",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS nursery_id INTEGER REFERENCES nurseries(id);",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id INTEGER REFERENCES users(id);"
    ]
    
    for cmd in commands:
        try:
            with engine.begin() as conn:
                conn.execute(text(cmd))
                print(f"Executed: {cmd}")
        except Exception as e:
            print(f"Error executing {cmd}: {e}")
