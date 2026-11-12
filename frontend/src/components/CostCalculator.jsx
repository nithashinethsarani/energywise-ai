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
      setErr("Please enter a valid units value.");
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
          placeholder="Monthly units (kWh)"
          value={units}
          onChange={(e) => setUnits(e.target.value)}
        />
        <button className="btn" type="submit">
          Calculate
        </button>
      </form>
      {err && <div className="msg-err">{err}</div>}
      {result && (
        <div className="calc-result">
          <div className="big">Rs. {Number(result.estimated_cost).toLocaleString("en-US")}</div>
          <div className="sub">Estimate for {result.units} kWh</div>
        </div>
      )}
      <p className="note">
        * This is only an approximate value. It should be updated according to the official CEB / PUCSL tariff.
      </p>
    </div>
  );
}