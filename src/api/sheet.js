export default async function handler(req, res) {
  const url = "https://script.google.com/macros/s/AKfycbxFyx8d8ZRsypQewf5lea7e9PnI94w-IoIMBI_unXhqgXYksQb0rLni6nwO7pUtFIiF/exec";

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined
    });

    const data = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}