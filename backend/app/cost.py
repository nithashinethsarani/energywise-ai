# NOTE: placeholder tariff values. Before the report/demo, verify the current
# domestic tariff on the official CEB / PUCSL website and update these.
TARIFF_BLOCKS = [
    (30, 8.0),
    (60, 20.0),
    (90, 30.0),
    (120, 50.0),
    (180, 50.0),
    (float("inf"), 75.0),
]
FIXED_CHARGE = 400.0


def calculate_cost(monthly_units: float) -> float:
    remaining = max(monthly_units, 0.0)
    lower = 0.0
    total = 0.0
    for upper, rate in TARIFF_BLOCKS:
        block = min(remaining, upper - lower)
        if block <= 0:
            break
        total += block * rate
        remaining -= block
        lower = upper
    return round(total + FIXED_CHARGE, 2)
