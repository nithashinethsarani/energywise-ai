import { useCallback, useEffect, useState } from "react";
import * as api from "./api";
import Sidebar from "./components/Sidebar";
import StatCards from "./components/StatCards";
import { UsageChart, ForecastChart, WeekdayChart } from "./components/Charts";
import UsageForm from "./components/UsageForm";
import RecentRecords from "./components/RecentRecords";
import Recommendations from "./components/Recommendations";
import CostCalculator from "./components/CostCalculator";

const TITLES = {
  dashboard: ["Dashboard", "Overview of your household electricity usage"],
  forecast: ["AI Forecast", "Next month's predicted usage and bill"],
  usage: ["Add Usage", "Record your daily electricity usage"],
  tips: ["Saving Tips", "Recommendations based on your data"],
  bill: ["Bill Calculator", "Estimate your monthly electricity bill"],
  about: ["About System", "How EnergyWise AI works"],
};

const getPage = () => {
  const h = window.location.hash.replace("#", "");
  return TITLES[h] ? h : "dashboard";
};

function UsageAlert({ pred, pct }) {
  if (!pred) return null;
  return (
    <div className={"alert " + (pred.high_usage_flag ? "high" : "ok")}>
      <span>{pred.high_usage_flag ? "⚠️" : "✅"}</span>
      <span>
        {pred.high_usage_flag
          ? "Next month's usage is high."
          : "Next month's usage is at a normal level."}
        {pct !== null && ` Compared to the last 30 days: ${pct > 0 ? "+" : ""}${pct}%.`}
      </span>
    </div>
  );
}

export default function App() {
  const [page, setPageState] = useState(getPage());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pred, setPred] = useState(null);
  const [predMsg, setPredMsg] = useState("");
  const [online, setOnline] = useState(null);
  const [loading, setLoading] = useState(true);

  const setPage = (p) => {
    window.location.hash = p;
    setPageState(p);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onHash = () => setPageState(getPage());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

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

  const [title, subtitle] = TITLES[page];
  const m = pred?.model_metrics;

  return (
    <div className="shell">
      <Sidebar page={page} setPage={setPage} online={online} />

      <main className="main">
        <header className="page-head">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="btn ghost" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </header>

        {online === false && (
          <div className="alert err">
            ❌ Cannot connect to the backend server. Check that the backend is running, then press Refresh.
          </div>
        )}

        {page === "dashboard" && (
          <>
            <section className="hero">
              <h2>Manage your electricity usage smartly</h2>
              <p>
                Enter your usage every day. The AI estimates next month's usage and bill, and Big Data
                analytics identifies your usage patterns and gives you tips to save more.
              </p>
            </section>
            <UsageAlert pred={pred} pct={pct} />
            {online && !pred && predMsg && (
              <div className="alert info">ℹ️ Prediction: {predMsg}</div>
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
          </>
        )}

        {page === "forecast" && (
          <>
            <UsageAlert pred={pred} pct={pct} />
            <div className="stats three">
              <div className="stat accent">
                <div className="lbl">Predicted units</div>
                <div className="val">
                  {pred ? pred.predicted_units : "—"}
                  <small>kWh</small>
                </div>
              </div>
              <div className="stat accent">
                <div className="lbl">Estimated bill</div>
                <div className="val">
                  {pred ? "Rs. " + Number(pred.predicted_cost).toLocaleString("en-US") : "—"}
                </div>
              </div>
              <div className="stat">
                <div className="lbl">Model accuracy (MAE / MAPE)</div>
                <div className="val">
                  {m ? `${m.mae_kwh} kWh` : "—"}
                  <small>{m ? `${m.mape_percent}%` : ""}</small>
                </div>
              </div>
            </div>
            <section className="card">
              <div className="card-head">
                <div>
                  <h3>Next month's forecast (AI)</h3>
                  <p>{pred ? `Month: ${pred.month}` : "Ridge Regression model"}</p>
                </div>
                {m && (
                  <span className="chip">
                    Train {m.train_days} days · Test {m.test_days} days
                  </span>
                )}
              </div>
              <ForecastChart pred={pred} message={predMsg} />
            </section>
            {pred && (
              <section className="card" style={{ marginTop: 18 }}>
                <div className="card-head">
                  <div>
                    <h3>Daily forecast table</h3>
                    <p>Predicted kWh for each day</p>
                  </div>
                </div>
                <div className="table-wrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Predicted kWh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pred.daily_forecast.map((d) => {
                        const day = new Date(d.date).toLocaleDateString("en-US", {
                          weekday: "short",
                        });
                        const weekend = day === "Sat" || day === "Sun";
                        return (
                          <tr key={d.date} className={weekend ? "wk" : ""}>
                            <td>{d.date}</td>
                            <td>{day}</td>
                            <td>{d.units_kwh}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}

        {page === "usage" && (
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
                  <h3>Recent records</h3>
                  <p>Last 8</p>
                </div>
                <span className="chip">{records.length} total</span>
              </div>
              <RecentRecords records={records} onDelete={handleDelete} />
            </section>
          </div>
        )}

        {page === "tips" && (
          <section className="card">
            <div className="card-head">
              <div>
                <h3>Saving tips</h3>
                <p>Based on your data</p>
              </div>
            </div>
            <Recommendations tips={pred?.recommendations} />
          </section>
        )}

        {page === "bill" && (
          <div className="grid">
            <section className="card col-6">
              <div className="card-head">
                <div>
                  <h3>Calculate your bill</h3>
                  <p>Enter units to see the estimate</p>
                </div>
              </div>
              <CostCalculator />
            </section>
            <section className="card col-6">
              <div className="card-head">
                <div>
                  <h3>Your numbers</h3>
                  <p>From your recorded data</p>
                </div>
              </div>
              <div className="kv">
                <div><span>Last 30 days units</span><b>{summary ? summary.last_30_days_units + " kWh" : "—"}</b></div>
                <div><span>Last 30 days bill</span><b>{summary ? "Rs. " + Number(summary.last_30_days_cost).toLocaleString("en-US") : "—"}</b></div>
                <div><span>Predicted next month</span><b>{pred ? pred.predicted_units + " kWh" : "—"}</b></div>
                <div><span>Predicted bill</span><b>{pred ? "Rs. " + Number(pred.predicted_cost).toLocaleString("en-US") : "—"}</b></div>
              </div>
            </section>
          </div>
        )}

        {page === "about" && (
          <>
            <section className="card">
              <div className="card-head">
                <div>
                  <h3>How it works</h3>
                  <p>Data flow of EnergyWise AI</p>
                </div>
              </div>
              <div className="flow">
                <div className="step"><b>1. Input</b><span>Daily usage via React dashboard</span></div>
                <div className="arrow">→</div>
                <div className="step"><b>2. API</b><span>nginx → FastAPI (validation)</span></div>
                <div className="arrow">→</div>
                <div className="step"><b>3. Analytics</b><span>pandas patterns + Ridge Regression</span></div>
                <div className="arrow">→</div>
                <div className="step"><b>4. Output</b><span>Forecast, bill, alerts, tips</span></div>
              </div>
            </section>
            <div className="grid" style={{ marginTop: 18 }}>
              <section className="card col-6">
                <div className="card-head"><div><h3>Emerging technologies</h3></div></div>
                <div className="chips">
                  <span className="chip">AI (scikit-learn)</span>
                  <span className="chip">Big Data Analytics (pandas)</span>
                  <span className="chip">Cloud (AWS EC2 + S3)</span>
                  <span className="chip">Docker</span>
                  <span className="chip">Linux (Ubuntu)</span>
                </div>
              </section>
              <section className="card col-6">
                <div className="card-head"><div><h3>Model validation</h3></div></div>
                <div className="kv">
                  <div><span>Algorithm</span><b>Ridge Regression</b></div>
                  <div><span>Split</span><b>Time-based 80 / 20</b></div>
                  <div><span>MAE</span><b>{m ? m.mae_kwh + " kWh" : "—"}</b></div>
                  <div><span>MAPE</span><b>{m ? m.mape_percent + "%" : "—"}</b></div>
                </div>
              </section>
            </div>
          </>
        )}

        <p className="footer">EnergyWise AI · Emerging Technologies Course Work 2026</p>
      </main>
    </div>
  );
}