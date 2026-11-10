KEYWORD_TIPS = {
    "ac": "AC එක 24-26°C දී පාවිච්චි කරන්න, සහ filter නිතර පිරිසිදු කරන්න.",
    "iron": "ඇඳුම් කිහිපයක් එකවර අයන් කරන්න, එවිට නැවත නැවත රත්වීම අඩුයි.",
    "heater": "Water heater එක අවශ්‍ය වේලාවට පමණක් on කරන්න, timer එකක් භාවිතා කරන්න.",
    "pump": "Water pump එක tank එක පිරෙන වේලාවට පමණක් ධාවනය කරන්න.",
    "fridge": "Fridge door එක නිතර විවෘත කිරීමෙන් වළකින්න, පසුපස ඇති coils පිරිසිදු කරන්න.",
}


def build_tips(patterns, high_flag, records):
    tips = []
    if high_flag:
        tips.append("ඉදිරි මාසයේ usage එක ඉහළයි. බිල අඩුකරගැනීමට පහත උපදෙස් අනුගමනය කරන්න.")
    wk, we = patterns.get("weekday_avg"), patterns.get("weekend_avg")
    if wk and we and we > wk * 1.2:
        tips.append("සති අන්ත වල usage එක සාමාන්‍යයට වඩා ඉහළයි. නිවසේ ඉන්න අවස්ථාවල අනවශ්‍ය උපකරණ off කරන්න.")
    notes = " ".join((r.get("appliance_note") or "").lower() for r in records[-30:])
    for key, tip in KEYWORD_TIPS.items():
        if key in notes:
            tips.append(tip)
    tips += [
        "LED බල්බ පාවිච්චි කරන්න.",
        "Standby mode එකේ ඇති උපකරණ (TV, charger) plug එකෙන් ගලවන්න.",
        "දිවා කාලයේ ස්වභාවික ආලෝකය භාවිතා කරන්න.",
    ]
    return tips
