import os
import requests
import json
import re
from dotenv import load_dotenv

load_dotenv('backend/.env')
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

res = requests.get(f'{url}/rest/v1/gpus', headers={'apikey': key, 'Authorization': f'Bearer {key}'})
gpus = res.json()

discrepancies = []
for gpu in gpus:
    name = gpu['name']
    vram_gb = gpu['vram_gb']
    
    # Extract xxGB from name
    match = re.search(r'(\d+)GB', name, re.IGNORECASE)
    if match:
        expected_vram = float(match.group(1))
        if vram_gb != expected_vram:
            discrepancies.append({
                'id': gpu['id'],
                'name': name,
                'vram_gb_db': vram_gb,
                'vram_gb_expected': expected_vram
            })

if discrepancies:
    print(f"Found {len(discrepancies)} discrepancies:")
    for d in discrepancies:
        print(f"Name: {d['name']}, DB VRAM: {d['vram_gb_db']}, Expected: {d['vram_gb_expected']}")
        
        # Optionally, fix them automatically
        patch_res = requests.patch(
            f"{url}/rest/v1/gpus?id=eq.{d['id']}", 
            headers={'apikey': key, 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'},
            json={'vram_gb': d['vram_gb_expected']}
        )
        print(f"Updated {d['name']} -> {d['vram_gb_expected']}GB (Status: {patch_res.status_code})")
else:
    print("No discrepancies found.")
