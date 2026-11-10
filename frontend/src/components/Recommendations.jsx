export default function Recommendations({ tips }) {
  if (!tips || tips.length === 0) {
    return <div className="empty">Enter at least 14 days of data to get recommendations.</div>;
  }
  return (
    <ul className="tips">
      {tips.map((t, i) => (
        <li key={i}>
          <span className="b">💡</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}