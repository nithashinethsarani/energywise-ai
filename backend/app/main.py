from datetime import date as date_type
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import db, ml, cost, tips

app = FastAPI(title="EnergyWise AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class UsageRecord(BaseModel):
    date: date_type
    units_kwh: float = Field(ge=0, le=500)
    household_size: Optional[int] = Field(default=None, ge=1, le=30)
    appliance_note: Optional[str] = None


@app.on_event("startup")
def startup():
    db.init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/records")
def add_record(r: UsageRecord):
    db.upsert_record(r.date.isoformat(), r.units_kwh, r.household_size, r.appliance_note)
    return {"message": "saved"}


@app.post("/records/bulk")
def add_bulk(items: List[UsageRecord]):
    for r in items:
        db.upsert_record(r.date.isoformat(), r.units_kwh, r.household_size, r.appliance_note)
    return {"message": f"{len(items)} records saved"}


@app.get("/records")
def list_records():
    return db.all_records()


@app.delete("/records/{date}")
def remove_record(date: str):
    db.delete_record(date)
    return {"message": "deleted"}


@app.get("/summary")
def summary():
    records = db.all_records()
    if len(records) < 2:
        raise HTTPException(400, "Please add more data.")
    patterns = ml.analyze_patterns(records)
    last30 = ml.last_30_days_units(records)
    return {**patterns, "last_30_days_units": round(last30, 2),
            "last_30_days_cost": cost.calculate_cost(last30)}


@app.get("/predict")
def predict():
    records = db.all_records()
    try:
        result = ml.predict_next_month(records)
    except ValueError as e:
        raise HTTPException(400, str(e))

    predicted_cost = cost.calculate_cost(result["predicted_units"])
    last30 = ml.last_30_days_units(records)
    high_flag = result["predicted_units"] > last30 * 1.15

    patterns = ml.analyze_patterns(records)
    return {
        "predicted_units": result["predicted_units"],
        "predicted_cost": predicted_cost,
        "high_usage_flag": bool(high_flag),
        "month": result["month"],
        "daily_forecast": result["daily_forecast"],
        "model_metrics": result["metrics"],
        "recommendations": tips.build_tips(patterns, high_flag, records),
    }


@app.get("/cost")
def cost_estimate(units: float):
    return {"units": units, "estimated_cost": cost.calculate_cost(units)}
