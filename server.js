// const express = require("express");
// const { writePolygon, readPolygon } = require("./polygon");
// const { writeFabric, readFabric } = require("./fabric");
// const { measure } = require("./performance");

// const app = express();
// app.use(express.json());

// app.post("/write", async (req, res) => {
//   const { data, target } = req.body;

//   const result = await measure(async () => {
//     if (target === "polygon") return await writePolygon(data);
//     if (target === "fabric") return await writeFabric(data);
//   });

//   res.json(result);
// });

// app.get("/read/:target", async (req, res) => {
//   const target = req.params.target;

//   const result = await measure(async () => {
//     if (target === "polygon") return await readPolygon();
//     if (target === "fabric") return await readFabric();
//   });

//   res.json(result);
// });

// app.listen(3000, () => console.log("Server running on port 3000"));

// server.js
const express    = require("express");
const { writePolygon, readPolygon } = require("./polygon");
const { writeFabric,  readFabric  } = require("./fabric");
const { measure }                   = require("./performance");
const metricsStore                  = require("./metricsStore");

const app = express();
app.use(express.json());

// ─── WRITE endpoint ───────────────────────────────────────
app.post("/write", async (req, res) => {
  const { data, target } = req.body;

  if (!data || !target) {
    return res.status(400).json({ error: "Missing 'data' or 'target' in request body" });
  }

  const result = await measure(
    async () => {
      if (target === "polygon") return await writePolygon(data);
      if (target === "fabric")  return await writeFabric(data);
      throw new Error("Unknown target: " + target);
    },
    target,      // ← now passing target
    "write"      // ← and operation
  );

  res.json(result);
});

// ─── READ endpoint ────────────────────────────────────────
app.get("/read/:target", async (req, res) => {
  const target = req.params.target;

  const result = await measure(
    async () => {
      if (target === "polygon") return await readPolygon();
      if (target === "fabric")  return await readFabric();
      throw new Error("Unknown target: " + target);
    },
    target,
    "read"
  );

  res.json(result);
});

// ─── METRICS endpoint (new) ───────────────────────────────
// Call this AFTER load test finishes to get all data
app.get("/metrics", (req, res) => {
  res.json({
    summary: metricsStore.getSummary(),
    all_records: metricsStore.getAll()
  });
});

// ─── START SERVER ─────────────────────────────────────────
app.listen(3000, () => {
  console.log("✅ Middleware server running on port 3000");
  console.log("   POST /write         → write to blockchain");
  console.log("   GET  /read/:target  → read from blockchain");
  console.log("   GET  /metrics       → get all performance data");
});