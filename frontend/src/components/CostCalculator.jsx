import { useState } from "react";
import { getCost } from "../api";

export default function CostCalculator() {
  const [units, setUnits] = useState("");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  async function calc(e) {
    e.preventDefault();
    setErr("");
    const u = parseFloat(units);
    if (isNaN(u) || u < 0) {
      setErr("නිවැරදි units අගයක් ඇතුළත් කරන්න.");
      return;
    }
    try {
      const data = await getCost(u);
      setResult(data);
    } catch (ex) {
      setErr(ex.message);
    }
  }

  return (
    <div>
      <form className="calc-row" onSubmit={calc}>
        <input
          type="number"
          min="0"
          step="0.1"
          placeholder="මාසික units (kWh)"
          value={units}
          onChange={(e) => setUnits(e.target.value)}
        />
        <button className="btn" type="submit">
          ගණනය
        </button>
      </form>
      {err && <div className="msg-err">{err}</div>}
      {result && (
        <div className="calc-result">
          <div className="big">Rs. {Number(result.estimated_cost).toLocaleString("en-US")}</div>
          <div className="sub">{result.units} kWh සඳහා ඇස්තමේන්තුව</div>
        </div>
      )}
      <p className="note">
        * මෙය ආසන්න අගයක් පමණයි. නිල CEB / PUCSL tariff අනුව යාවත්කාලීන කළ යුතුයි.
      </p>
    </div>
  );
}