import os
import sqlite3
from pathlib import Path

DB_PATH = Path(
    os.environ.get("DB_PATH", Path(__file__).resolve().parent.parent / "energywise.db")
)


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS usage_records (
                date TEXT PRIMARY KEY,
                units_kwh REAL NOT NULL,
                household_size INTEGER,
                appliance_note TEXT
            )
            """
        )


def upsert_record(date, units_kwh, household_size=None, appliance_note=None):
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO usage_records (date, units_kwh, household_size, appliance_note)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET
                units_kwh=excluded.units_kwh,
                household_size=excluded.household_size,
                appliance_note=excluded.appliance_note
            """,
            (date, units_kwh, household_size, appliance_note),
        )


def all_records():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM usage_records ORDER BY date").fetchall()
    return [dict(r) for r in rows]


def delete_record(date):
    with get_conn() as conn:
        conn.execute("DELETE FROM usage_records WHERE date = ?", (date,))
