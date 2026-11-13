import Icon from "./Icon";

export default function Recommendations({ tips }) {
  if (!tips || tips.length === 0) {
    return (
      <div className="empty">
        Add at least 14 days of usage data to get recommendations.
      </div>
    );
  }
  return (
    <ul className="tips">
      {tips.map((t, i) => (
        <li key={i}>
          <span className="b">
            <Icon name="bulb" size={15} />
          </span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}