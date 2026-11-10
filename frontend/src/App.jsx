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
            <p>Household Electricity Usage Analyzer</p>
          </div>
        </div>
        <div className="actions">
          <span className="pill">
            <span className={"dot " + (online === null ? "" : online ? "on" : "off")} />
            {online === null ? "Connecting..." : online ? "API online" : "API offline"}
          </span>
          <button className="btn ghost" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </header>

      <section className="hero">
        <h2>Manage your electricity usage smartly</h2>
        <p>
          Enter your usage every day. The AI estimates next month's usage and bill, and Big Data
          analytics identifies your usage patterns and gives you tips to save more.
        </p>
      </section>

      {online === false && (
        <div className="alert err">
          ❌ Cannot connect to the backend server. Check whether uvicorn is running in the backend terminal, then press Refresh.
        </div>
      )}

      {pred && (
        <div className={"alert " + (pred.high_usage_flag ? "high" : "ok")}>
          <span>{pred.high_usage_flag ? "⚠️" : "✅"}</span>
          <span>
            {pred.high_usage_flag
              ? "Next month's usage is high."
              : "Next month's usage is at a normal level."}
            {pct !== null &&
              ` Compared to the last 30 days: ${pct > 0 ? "+" : ""}${pct}%.`}
          </span>
        </div>
      )}

      {online && !pred && predMsg && (
        <div className="alert info">ℹ️ For prediction: {predMsg}</div>
      )}

      <StatCards pred={pred} summary={summary} />

      <div className="grid">
        <section className="card col-8">
          <div className="card-head">
            <div>
              <h3>Daily usage history</h3>
              <p>Last 60 days (kWh)</p>
            </div>
            <span className="chip">{records.length} records</span>
          </div>
          <UsageChart records={records} />
        </section>

        <section className="card col-4">
          <div className="card-head">
            <div>
              <h3>Average by day of the week</h3>
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
              <h3>Next month's forecast (AI)</h3>
              <p>{pred ? `Month: ${pred.month}` : "Ridge Regression model"}</p>
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
              <h3>Calculate your bill</h3>
              <p>Enter units to see the estimate</p>
            </div>
          </div>
          <CostCalculator />
        </section>
      </div>

      <div className="grid">
        <section className="card col-5">
          <div className="card-head">
            <div>
              <h3>Enter today's usage</h3>
              <p>Add one record every day</p>
            </div>
          </div>
          <UsageForm onAdd={handleAdd} />
        </section>

        <section className="card col-7">
          <div className="card-head">
            <div>
              <h3>Saving tips</h3>
              <p>Based on your data</p>
            </div>
          </div>
          <Recommendations tips={pred?.recommendations} />
        </section>
      </div>

      <div className="grid">
        <section className="card col-12">
          <div className="card-head">
            <div>
              <h3>Recent records</h3>
              <p>Last 8</p>
            </div>
          </div>
          <RecentRecords records={records} onDelete={handleDelete} />
        </section>
      </div>

      <p className="footer">EnergyWise AI · Emerging Technologies Course Work 2026</p>
    </div>
  );
}