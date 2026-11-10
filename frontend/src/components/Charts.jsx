import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend
);

const BLUE = "#2f80ed";
const SKY = "#7cc4ff";

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0b2545",
      padding: 10,
      cornerRadius: 10,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 10, color: "#5b7191" },
    },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(47,128,237,0.08)" },
      ticks: { color: "#5b7191" },
    },
  },
};

export function UsageChart({ records }) {
  if (!records || records.length === 0) {
    return <div className="empty">No data yet. Enter usage using the form on the right.</div>;
  }
  const data = records.slice(-60);
  return (
    <div className="chart-box">
      <Line
        options={baseOptions}
        data={{
          labels: data.map((r) => r.date.slice(5)),
          datasets: [
            {
              label: "kWh",
              data: data.map((r) => r.units_kwh),
              borderColor: BLUE,
              backgroundColor: "rgba(47,128,237,0.12)",
              fill: true,
              tension: 0.35,
              pointRadius: 2,
              borderWidth: 2.5,
            },
          ],
        }}
      />
    </div>
  );
}

export function ForecastChart({ pred, message }) {
  if (!pred) {
    return (
      <div className="empty">
        {message || "At least 14 days of data are required to show the forecast."}
      </div>
    );
  }
  const f = pred.daily_forecast;
  return (
    <div className="chart-box">
      <Line
        options={baseOptions}
        data={{
          labels: f.map((d) => d.date.slice(5)),
          datasets: [
            {
              label: "Predicted kWh",
              data: f.map((d) => d.units_kwh),
              borderColor: SKY,
              backgroundColor: "rgba(124,196,255,0.22)",
              fill: true,
              tension: 0.35,
              borderDash: [6, 4],
              pointRadius: 2,
              borderWidth: 2.5,
            },
          ],
        }}
      />
    </div>
  );
}

const DAYS = [
  ["Monday", "Mon"],
  ["Tuesday", "Tue"],
  ["Wednesday", "Wed"],
  ["Thursday", "Thu"],
  ["Friday", "Fri"],
  ["Saturday", "Sat"],
  ["Sunday", "Sun"],
];

export function WeekdayChart({ summary }) {
  if (!summary || !summary.by_weekday) {
    return <div className="empty">More data is needed for pattern analysis.</div>;
  }
  const vals = DAYS.map(([full]) => summary.by_weekday[full] ?? 0);
  return (
    <div className="chart-box">
      <Bar
        options={baseOptions}
        data={{
          labels: DAYS.map(([, short]) => short),
          datasets: [
            {
              label: "Avg kWh",
              data: vals,
              backgroundColor: DAYS.map(([full]) =>
                full === "Saturday" || full === "Sunday" ? BLUE : SKY
              ),
              borderRadius: 8,
              maxBarThickness: 28,
            },
          ],
        }}
      />
    </div>
  );
}