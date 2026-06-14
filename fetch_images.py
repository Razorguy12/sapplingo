import urllib.request
import urllib.parse
import json
import re
import time
from database import SessionLocal, engine
import models.models as models

plants = [
    ("Monstera Deliciosa", "Monstera_deliciosa"),
    ("Snake Plant", "Dracaena_trifasciata"),
    ("Fiddle Leaf Fig", "Ficus_lyrata"),
    ("Peace Lily", "Spathiphyllum"),
    ("Aloe Vera", "Aloe_vera"),
    ("ZZ Plant", "Zamioculcas"),
    ("Spider Plant", "Chlorophytum_comosum"),
    ("Pothos", "Epipremnum_aureum"),
    ("Rubber Plant", "Ficus_elastica"),
    ("Bird of Paradise", "Strelitzia_reginae"),
    ("Philodendron", "Philodendron_hederaceum"),
    ("Calathea", "Goeppertia_orbifolia"),
    ("Jade Plant", "Crassula_ovata"),
    ("String of Pearls", "Curio_rowleyanus"),
    ("Boston Fern", "Nephrolepis_exaltata")
]

def fetch_json(url):
    for i in range(3):
        try:
            time.sleep(2)
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Bot for Plantify App)"})
            res = urllib.request.urlopen(req).read().decode("utf-8")
            return json.loads(res)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(5)
            else:
                return None
    return None

def get_wiki_images(title, count=3):
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={title}&prop=images&format=json&imlimit=20"
    data = fetch_json(url)
    if not data: return []
    
    pages = data["query"]["pages"]
    images = []
    for page_id in pages:
        if "images" in pages[page_id]:
            for img in pages[page_id]["images"]:
                t = img["title"].lower()
                if not t.endswith((".svg", ".png", "map.jpg", "logo.jpg", "icon.jpg")):
                    images.append(img["title"])
    
    urls = []
    for img_title in images[:count]:
        try:
            img_title_enc = urllib.parse.quote(img_title)
            img_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={img_title_enc}&prop=imageinfo&iiprop=url&format=json"
            data2 = fetch_json(img_url)
            if data2:
                pages2 = data2["query"]["pages"]
                for pid in pages2:
                    if "imageinfo" in pages2[pid]:
                        urls.append(pages2[pid]["imageinfo"][0]["url"])
        except Exception as e:
            print(f"Error fetching specific image {img_title}: {e}")
    
    # Fallback if we don't get enough
    while len(urls) < count:
        if len(urls) > 0:
            urls.append(urls[0])
        else:
            urls.append("https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")
    
    return urls

all_urls = {}
for name, title in plants:
    print(f"Fetching images for {name}...")
    all_urls[name] = get_wiki_images(title, 3)

with open("main.py", "r") as f:
    content = f.read()

def replacer(match):
    replacer.index += 1
    plant_name = plants[replacer.index][0]
    urls = all_urls[plant_name]
    img1 = urls[0]
    img23 = ",".join(urls[1:])
    return f'image_url="{img1}", description="{match.group(2)}", climate="{match.group(3)}", is_indoor={match.group(4)}, soil_type="{match.group(5)}", extra_images="{img23}"'

replacer.index = -1

pattern = r'image_url="[^"]+", description="([^"]+)", climate="([^"]+)", is_indoor=(True|False), soil_type="([^"]+)", extra_images="[^"]+"'
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
