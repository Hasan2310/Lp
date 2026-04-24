const GAS_URL = "https://script.google.com/macros/s/AKfycbxFyx8d8ZRsypQewf5lea7e9PnI94w-IoIMBI_unXhqgXYksQb0rLni6nwO7pUtFIiF/exec";

export default async function handler(req, res) {
  const response = await fetch(GAS_URL, {
    method: req.method,
    headers: { "Content-Type": "application/json" },
    body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
  });

  const data = await response.text();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(data);
}