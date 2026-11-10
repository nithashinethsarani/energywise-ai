import { useCallback, useEffect, useState } from "react";
import * as api from "./api";
import StatCards from "./components/StatCards";
import { UsageChart, ForecastChart, WeekdayChart } from "./components/Charts";
import UsageForm from "./components/UsageForm";
import RecentRecords from "./components/RecentRecords";
import Recommendations from "./components/Recommendations";
import CostCalculator from "./components/CostCalculator";

export default function App() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pred, setPred] = useState(null);
  const [predMsg, setPredMsg] = useState("");
  const [online, setOnline] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await api.health();
      setOnline(true);
    } catch {
      setOnline(false);
      setLoading(false);
      return;
    }
    const [r, s, p] = await Promise.allSettled([
      api.getRecords(),
      api.getSummary(),
      api.getPredict(),
    ]);
    setRecords(r.status === "fulfilled" ? r.value : []);
    setSummary(s.status === "fulfilled" ? s.value : null);
    if (p.status === "fulfilled") {
      setPred(p.value);
      setPredMsg("");
    } else {
      setPred(null);
      setPredMsg(p.reason.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(record) {
    await api.addRecord(record);
    await load();
  }

  async function handleDelete(date) {
    await api.deleteRecord(date);
    await load();
  }

  const pct =
    pred && summary && summary.last_30_days_units > 0
      ? ((pred.predicted_units / summary.last_30_days_units - 1) * 100).toFixed(1)
      : null;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo">⚡</div>
          <div>
            <h1>
              EnergyWise <span>AI</span>
            </h1>
            <p>ගෘහ විදුලි පරිභෝජන විශ්ලේෂකය</p>
          </div>
        </div>
        <div className="actions">
          <span className="pill">
            <span className={"dot " + (online === null ? "" : online ? "on" : "off")} />
            {online === null ? "සම්බන්ධ වෙමින්..." : online ? "API සක්‍රියයි" : "API අක්‍රියයි"}
          </span>
          <button className="btn ghost" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </header>

      <section className="hero">
        <h2>ඔබේ විදුලි පරිභෝජනය බුද්ධිමත්ව කළමනාකරණය කරන්න</h2>
        <p>
          දිනපතා usage එක ඇතුළත් කරන්න. AI මගින් ඉදිරි මාසයේ පරිභෝජනය සහ බිල ඇස්තමේන්තු කර,
          Big Data analytics මගින් ඔබේ පරිභෝජන රටා හඳුනාගෙන, ඉතිරි කරගන්න උපදෙස් ලබා දෙනවා.
        </p>
      </section>

      {online === false && (
        <div className="alert err">
          ❌ Backend server එකට සම්බන්ධ වෙන්න බෑ. Backend terminal එකේ uvicorn run වෙනවද බලන්න, ඊට පස්සේ Refresh ඔබන්න.
        </div>
      )}

      {pred && (
        <div className={"alert " + (pred.high_usage_flag ? "high" : "ok")}>
          <span>{pred.high_usage_flag ? "⚠️" : "✅"}</span>
          <span>
            {pred.high_usage_flag
              ? "ඉදිරි මාසයේ පරිභෝජනය ඉහළයි."
              : "ඉදිරි මාසයේ පරිභෝජනය සාමාන්‍ය මට්ටමේ පවතී."}
            {pct !== null &&
              ` පසුගිය දින 30 හා සසඳන විට ${pct > 0 ? "+" : ""}${pct}%.`}
          </span>
        </div>
      )}

      {online && !pred && predMsg && (
        <div className="alert info">ℹ️ Prediction සඳහා: {predMsg}</div>
      )}

      <StatCards pred={pred} summary={summary} />

      <div className="grid">
        <section className="card col-8">
          <div className="card-head">
            <div>
              <h3>දෛනික පරිභෝජන ඉතිහාසය</h3>
              <p>අවසන් දින 60 (kWh)</p>
            </div>
            <span className="chip">{records.length} records</span>
          </div>
          <UsageChart records={records} />
        </section>

        <section className="card col-4">
          <div className="card-head">
            <div>
              <h3>සතියේ දින අනුව සාමාන්‍යය</h3>
              <p>Usage pattern (Big Data Analytics)</p>
            </div>
          </div>
          <WeekdayChart summary={summary} />
        </section>
      </div>

      <div className="grid">
        <section className="card col-8">
          <div className="card-head">
            <div>
              <h3>ඉදිරි මාසයේ forecast (AI)</h3>
              <p>{pred ? `මාසය: ${pred.month}` : "Ridge Regression model"}</p>
            </div>
            {pred?.model_metrics && (
              <span className="chip">
                MAE {pred.model_metrics.mae_kwh} kWh · MAPE {pred.model_metrics.mape_percent}%
              </span>
            )}
          </div>
          <ForecastChart pred={pred} message={predMsg} />
        </section>

        <section className="card col-4">
          <div className="card-head">
            <div>
              <h3>බිල ගණනය කරන්න</h3>
              <p>Units ඇතුළත් කර ඇස්තමේන්තුව බලන්න</p>
            </div>
          </div>
          <CostCalculator />
        </section>
      </div>

      <div className="grid">
        <section className="card col-5">
          <div className="card-head">
            <div>
              <h3>අද usage ඇතුළත් කරන්න</h3>
              <p>දිනපතා record එකක් එක් කරන්න</p>
            </div>
          </div>
          <UsageForm onAdd={handleAdd} />
        </section>

        <section className="card col-7">
          <div className="card-head">
            <div>
              <h3>ඉතිරි කරගැනීමේ උපදෙස්</h3>
              <p>ඔබේ දත්ත මත පදනම්ව</p>
            </div>
          </div>
          <Recommendations tips={pred?.recommendations} />
        </section>
      </div>

      <div className="grid">
        <section className="card col-12">
          <div className="card-head">
            <div>
              <h3>මෑත records</h3>
              <p>අවසන් 8</p>
            </div>
          </div>
          <RecentRecords records={records} onDelete={handleDelete} />
        </section>
      </div>

      <p className="footer">EnergyWise AI · Emerging Technologies Course Work 2026</p>
    </div>
  );
}