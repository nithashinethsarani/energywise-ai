import random
from datetime import date, timedelta
import requests

random.seed(42)
start = date(2026, 5, 1)
items = []
for i in range(180):
    d = start + timedelta(days=i)
    base = 6.0 + 0.01 * i
    if d.weekday() >= 5:
        base += 1.5
    note = None
    if random.random() < 0.15:
        base += 3.0
        note = "AC use kala"
    items.append({
        "date": d.isoformat(),
        "units_kwh": round(max(base + random.gauss(0, 0.8), 1), 2),
        "household_size": 4,
        "appliance_note": note,
    })

r = requests.post("http://localhost:8000/records/bulk", json=items)
print(r.status_code, r.json())
