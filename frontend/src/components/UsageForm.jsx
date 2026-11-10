import { useState } from "react";

const today = () => new Date().toISOString().slice(0, 10);

export default function UsageForm({ onAdd }) {
  const [date, setDate] = useState(today());
  const [units, setUnits] = useState("");
  const [hh, setHh] = useState("4");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    const u = parseFloat(units);
    if (isNaN(u) || u < 0 || u > 500) {
      setErr("Units අගය 0 සහ 500 අතර විය යුතුයි.");
      return;
    }
    setBusy(true);
    try {
      await onAdd({
        date,
        units_kwh: u,
        household_size: hh ? parseInt(hh, 10) : null,
        appliance_note: note.trim() || null,
      });
      setUnits("");
      setNote("");
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <div className="field">
          <label>දිනය</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="field">
          <label>Units (kWh)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="උදා: 7.5"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>පවුලේ සාමාජිකයන් (optional)</label>
          <input type="number" min="1" max="30" value={hh} onChange={(e) => setHh(e.target.value)} />
        </div>
        <div className="field">
          <label>උපකරණ සටහන (optional)</label>
          <input
            type="text"
            placeholder="උදා: AC use කළා"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="field full">
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "සුරකිමින්..." : "Record එක සුරකින්න"}
          </button>
        </div>
      </div>
      {err && <div className="msg-err">{err}</div>}
    </form>
  );
}