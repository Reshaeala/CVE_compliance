// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

// Allow your Vite dev server to call this API
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "HEAD", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // set true only if you actually use cookies/auth
  })
);

app.get("/cve", async (req, res) => {
  try {
    const { vendor = "microsoft", page = 1 } = req.query;
    const r = await fetch(
      `https://app.opencve.io/api/cve?vendor=${vendor}&page=${page}`,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.OPENCVE_USERNAME}:${process.env.OPENCVE_PASSWORD}`
            ).toString("base64"),
          Accept: "application/json",
        },
      }
    );

    // Forward status and JSON
    const txt = await r.text();
    res.status(r.status);
    res.setHeader("Content-Type", "application/json");
    res.send(txt);
  } catch (e) {
    res.status(500).json({ error: "Proxy failed", details: String(e) });
  }
});

app.listen(PORT, () =>
  console.log(`Proxy running on http://localhost:${PORT}`)
);
