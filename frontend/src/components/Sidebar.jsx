import Icon from "./Icon";

const ITEMS = [
  ["dashboard", "dashboard", "Dashboard"],
  ["forecast", "forecast", "AI Forecast"],
  ["usage", "plus", "Add Usage"],
  ["tips", "bulb", "Saving Tips"],
  ["bill", "calc", "Bill Calculator"],
  ["about", "info", "About System"],
];

export default function Sidebar({ page, setPage, online }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">
          <Icon name="bolt" size={22} />
        </div>
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
            <Icon name={icon} size={19} />
            {label}
          </button>
        ))}
      </nav>

      <div className="side-foot">
        <span className="pill">
          <span className={"dot " + (online === null ? "" : online ? "on" : "off")} />
          {online === null ? "Connecting..." : online ? "API online" : "API offline"}
        </span>
      </div>
    </aside>
  );
}