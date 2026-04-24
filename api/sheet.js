export default async function handler(req, res) {
  // GANTI URL INI DENGAN URL GAS LU YANG BARU DI-DEPLOY
  const GAS_URL = "https://script.google.com/macros/s/AKfycbxFyx8d8ZRsypQewf5lea7e9PnI94w-IoIMBI_unXhqgXYksQb0rLni6nwO7pUtFIiF/exec";

  try {
    const options = {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
      redirect: "follow"
    };
    
    const response = await fetch(GAS_URL, options);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}