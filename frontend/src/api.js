const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const data = await res.json();
      msg = data.detail || msg;
    } catch {
      /* ignore */
    }
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return res.json();
}

export const health = () => request("/health");
export const getRecords = () => request("/records");
export const addRecord = (record) =>
  request("/records", { method: "POST", body: JSON.stringify(record) });
export const deleteRecord = (date) =>
  request(`/records/${date}`, { method: "DELETE" });
export const getSummary = () => request("/summary");
export const getPredict = () => request("/predict");
export const getCost = (units) => request(`/cost?units=${units}`);