KEYWORD_TIPS = {
    "ac": "Use the AC at 24-26°C, and clean the filter regularly.",
    "iron": "Iron several clothes at once, so the iron heats up less often.",
    "heater": "Turn on the water heater only when needed, and use a timer.",
    "pump": "Run the water pump only when the tank needs filling.",
    "fridge": "Avoid opening the fridge door often, and clean the coils at the back.",
}


def build_tips(patterns, high_flag, records):
    tips = []
    if high_flag:
        tips.append("Next month's usage is high. Follow the tips below to reduce your bill.")
    wk, we = patterns.get("weekday_avg"), patterns.get("weekend_avg")
    if wk and we and we > wk * 1.2:
        tips.append("Weekend usage is higher than average. Turn off unnecessary appliances while you are at home.")
    notes = " ".join((r.get("appliance_note") or "").lower() for r in records[-30:])
    for key, tip in KEYWORD_TIPS.items():
        if key in notes:
            tips.append(tip)
    tips += [
        "Use LED bulbs.",
        "Unplug appliances left on standby mode (TV, charger).",
        "Use natural light during the daytime.",
    ]
    return tips