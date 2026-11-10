import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error

MIN_RECORDS = 14


def _to_df(records):
    df = pd.DataFrame(records)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)
    df["household_size"] = df["household_size"].fillna(df["household_size"].median()).fillna(4)
    return df


def _features(dates: pd.Series, start: pd.Timestamp, hh: pd.Series):
    t = (dates - start).dt.days.values.reshape(-1, 1)
    dow = pd.get_dummies(dates.dt.dayofweek).reindex(columns=range(7), fill_value=0).values
    month_angle = 2 * np.pi * dates.dt.month.values / 12
    seasonal = np.column_stack([np.sin(month_angle), np.cos(month_angle)])
    return np.hstack([t, dow, seasonal, hh.values.reshape(-1, 1)]).astype(float)


def analyze_patterns(records):
    """Big Data Analytics: identify usage patterns."""
    df = _to_df(records)
    df["weekday"] = df["date"].dt.day_name()
    df["month"] = df["date"].dt.strftime("%Y-%m")
    by_weekday = df.groupby("weekday")["units_kwh"].mean().round(2).to_dict()
    monthly = df.groupby("month")["units_kwh"].sum().round(2)
    weekend = df[df["date"].dt.dayofweek >= 5]["units_kwh"].mean()
    weekday = df[df["date"].dt.dayofweek < 5]["units_kwh"].mean()
    return {
        "avg_daily": round(float(df["units_kwh"].mean()), 2),
        "peak_day": df.loc[df["units_kwh"].idxmax(), "date"].strftime("%Y-%m-%d"),
        "peak_units": round(float(df["units_kwh"].max()), 2),
        "by_weekday": by_weekday,
        "monthly_totals": monthly.to_dict(),
        "weekend_avg": round(float(weekend), 2) if not np.isnan(weekend) else None,
        "weekday_avg": round(float(weekday), 2) if not np.isnan(weekday) else None,
    }


def predict_next_month(records):
    """AI: predict next month's daily usage + model validation."""
    if len(records) < MIN_RECORDS:
        raise ValueError(f"At least {MIN_RECORDS} days of data are required for prediction.")

    df = _to_df(records)
    start = df["date"].min()
    X = _features(df["date"], start, df["household_size"])
    y = df["units_kwh"].values

    split = int(len(df) * 0.8)
    metrics = None
    if len(df) - split >= 3:
        m = Ridge(alpha=1.0).fit(X[:split], y[:split])
        pred = m.predict(X[split:])
        mae = mean_absolute_error(y[split:], pred)
        mape = float(np.mean(np.abs((y[split:] - pred) / np.maximum(y[split:], 0.1))) * 100)
        metrics = {"mae_kwh": round(float(mae), 3), "mape_percent": round(mape, 2),
                   "train_days": split, "test_days": len(df) - split}

    model = Ridge(alpha=1.0).fit(X, y)

    last = df["date"].max()
    first_next = (last + pd.offsets.MonthBegin(1)).normalize()
    future_dates = pd.Series(pd.date_range(first_next, first_next + pd.offsets.MonthEnd(0)))
    hh = pd.Series([df["household_size"].iloc[-1]] * len(future_dates))
    Xf = _features(future_dates, start, hh)
    daily = np.clip(model.predict(Xf), 0.1, None)

    return {
        "predicted_units": round(float(daily.sum()), 2),
        "month": first_next.strftime("%Y-%m"),
        "daily_forecast": [
            {"date": d.strftime("%Y-%m-%d"), "units_kwh": round(float(v), 2)}
            for d, v in zip(future_dates, daily)
        ],
        "metrics": metrics,
    }


def last_30_days_units(records):
    df = _to_df(records)
    cutoff = df["date"].max() - pd.Timedelta(days=29)
    return float(df[df["date"] >= cutoff]["units_kwh"].sum())
