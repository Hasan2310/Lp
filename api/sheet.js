const GAS_URL = "https://script.google.com/macros/s/AKfycbxFyx8d8ZRsypQewf5lea7e9PnI94w-IoIMBI_unXhqgXYksQb0rLni6nwO7pUtFIiF/exec";

export default async function handler(req, res) {
  try {
    let response;

    if (req.method === "GET") {
      response = await fetch(GAS_URL);
    } else {
      response = await fetch(GAS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body || {})
      });
    }

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "GAS bukan JSON",
        raw: text
      });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
}