const ITEMS = [
  ["dashboard", "📊", "Dashboard"],
  ["forecast", "🔮", "AI Forecast"],
  ["usage", "➕", "Add Usage"],
  ["tips", "💡", "Saving Tips"],
  ["bill", "🧮", "Bill Calculator"],
  ["about", "ℹ️", "About System"],
];

export default function Sidebar({ page, setPage, online }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">⚡</div>
        <div>
          <h1>
            EnergyWise <span>AI</span>
          </h1>
          <p>Household Electricity Analyzer</p>
        </div>
      </div>

      <nav className="nav">
        {ITEMS.map(([id, icon, label]) => (
          <button
            key={id}
            className={"nav-item" + (page === id ? " active" : "")}
            onClick={() => setPage(id)}
          >
            <span className="nav-ico">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="side-foot">
        <span className="pill">
          <span className={"dot " + (online === null ? "" : online ? "on" : "off")} />
          {online === null ? "Connecting..." : online ? "API online" : "API offline"}
        </span>
        <p className="side-note">Emerging Technologies · Course Work 2026</p>
      </div>
    </aside>
  );
}