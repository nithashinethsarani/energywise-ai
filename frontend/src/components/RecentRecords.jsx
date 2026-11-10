export default function RecentRecords({ records, onDelete }) {
  if (!records || records.length === 0) {
    return <div className="empty">තවම records නෑ.</div>;
  }
  const last = records.slice(-8).reverse();
  return (
    <div className="rec-list">
      {last.map((r) => (
        <div className="rec" key={r.date}>
          <div>
            <div className="d">{r.date}</div>
            <div className="n">
              {r.appliance_note ? r.appliance_note : "සටහනක් නෑ"}
              {r.household_size ? ` · සාමාජිකයන් ${r.household_size}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="u">{r.units_kwh} kWh</span>
            <button className="x" title="මකන්න" onClick={() => onDelete(r.date)}>
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}