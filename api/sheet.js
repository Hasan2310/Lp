const GAS_URL = "https://script.google.com/macros/s/AKfycbxFyx8d8ZRsypQewf5lea7e9PnI94w-IoIMBI_unXhqgXYksQb0rLni6nwO7pUtFIiF/exec";

export default async function handler(req, res) {
  try {
    const response = await fetch(GAS_URL, {
      method: req.method,
      headers: {
        "Content-Type": "application/json"
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined
    });

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // parse aman
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Invalid JSON from GAS", raw: text });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
}