import re
from database import SessionLocal, engine
import models.models as models

url_file = "urls"

with open(url_file, "r") as f:
    lines = f.read().splitlines()

plants_urls = {}
current_plant = None
for line in lines:
    line = line.strip()
    if not line:
        continue
    if line.endswith(":"):
        current_plant = line[:-1].strip().lower()
        plants_urls[current_plant] = []
    elif line.startswith("url"):
        parts = line.split(":", 1)
        if len(parts) == 2:
            plants_urls[current_plant].append(parts[1].strip())

with open("main.py", "r") as f:
    content = f.read()

def replacer(match):
    name = match.group(1)
    search_key = name.lower()
    
    urls = []
    if search_key in plants_urls:
        urls = plants_urls[search_key]
    else:
        for key in plants_urls:
            if search_key in key or key in search_key:
                urls = plants_urls[key]
                break
                
    if not urls:
        print(f"Warning: No URLs found for {name}")
        return match.group(0)
    
    img1 = urls[0]
    img23 = ",".join(urls[1:]) if len(urls) > 1 else ""
    
    return f'models.Plant(name="{name}", scientific_name="{match.group(2)}", age="{match.group(3)}", price={match.group(4)}, rating={match.group(5)}, image_url="{img1}", description="{match.group(6)}", climate="{match.group(7)}", is_indoor={match.group(8)}, soil_type="{match.group(9)}", extra_images="{img23}")'

pattern = r'models\.Plant\(name="([^"]+)", scientific_name="([^"]+)", age="([^"]+)", price=([0-9.]+), rating=([0-9.]+), image_url="[^"]+", description="([^"]+)", climate="([^"]+)", is_indoor=(True|False), soil_type="([^"]+)", extra_images="[^"]*"\)'

new_content = re.sub(pattern, replacer, content)

with open("main.py", "w") as f:
    f.write(new_content)

print("Rewrote main.py. Dropping DB and reseeding...")
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

import importlib
import main
importlib.reload(main)

db = SessionLocal()
try:
    print(main.seed_db(db))
finally:
    db.close()
