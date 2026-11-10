const fmt = (n, d = 0) =>
  n === null || n === undefined
    ? "—"
    : Number(n).toLocaleString("en-US", { maximumFractionDigits: d });

export default function StatCards({ pred, summary }) {
  const items = [
    {
      icon: "⚡",
      label: "ඉදිරි මාසයේ units (AI)",
      value: fmt(pred?.predicted_units, 1),
      unit: pred ? "kWh" : "",
      accent: true,
    },
    {
      icon: "💰",
      label: "ඇස්තමේන්තුගත බිල",
      value: pred ? "Rs. " + fmt(pred.predicted_cost) : "—",
      unit: "",
      accent: true,
    },
    {
      icon: "📈",
      label: "දෛනික සාමාන්‍යය",
      value: fmt(summary?.avg_daily, 2),
      unit: summary ? "kWh/දින" : "",
    },
    {
      icon: "🧾",
      label: "පසුගිය දින 30 බිල",
      value: summary ? "Rs. " + fmt(summary.last_30_days_cost) : "—",
      unit: "",
    },
  ];

  return (
    <div className="stats">
      {items.map((it) => (
        <div key={it.label} className={"stat" + (it.accent ? " accent" : "")}>
          <div className="ico">{it.icon}</div>
          <div className="lbl">{it.label}</div>
          <div className="val">
            {it.value}
            {it.unit && <small>{it.unit}</small>}
          </div>
        </div>
      ))}
    </div>
  );
}