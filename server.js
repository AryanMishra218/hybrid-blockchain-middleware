const express = require("express");
const { writePolygon, readPolygon } = require("./polygon");
const { writeFabric, readFabric } = require("./fabric");
const { measure } = require("./performance");

const app = express();
app.use(express.json());

app.post("/write", async (req, res) => {
  const { data, target } = req.body;

  const result = await measure(async () => {
    if (target === "polygon") return await writePolygon(data);
    if (target === "fabric") return await writeFabric(data);
  });

  res.json(result);
});

app.get("/read/:target", async (req, res) => {
  const target = req.params.target;

  const result = await measure(async () => {
    if (target === "polygon") return await readPolygon();
    if (target === "fabric") return await readFabric();
  });

  res.json(result);
});

app.listen(3000, () => console.log("Server running on port 3000"));