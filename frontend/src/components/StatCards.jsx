import Icon from "./Icon";

const fmt = (n, d = 0) =>
  n === null || n === undefined
    ? "—"
    : Number(n).toLocaleString("en-US", { maximumFractionDigits: d });

export default function StatCards({ pred, summary }) {
  const items = [
    {
      icon: "bolt",
      label: "Next month's units (AI)",
      value: fmt(pred?.predicted_units, 1),
      unit: pred ? "kWh" : "",
      accent: true,
    },
    {
      icon: "money",
      label: "Estimated bill",
      value: pred ? "Rs. " + fmt(pred.predicted_cost) : "—",
      unit: "",
      accent: true,
    },
    {
      icon: "activity",
      label: "Daily average",
      value: fmt(summary?.avg_daily, 2),
      unit: summary ? "kWh/day" : "",
    },
    {
      icon: "receipt",
      label: "Bill for the last 30 days",
      value: summary ? "Rs. " + fmt(summary.last_30_days_cost) : "—",
      unit: "",
    },
  ];

  return (
    <div className="stats">
      {items.map((it) => (
        <div key={it.label} className={"stat" + (it.accent ? " accent" : "")}>
          <div className="ico">
            <Icon name={it.icon} size={20} />
          </div>
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