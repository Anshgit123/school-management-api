const express = require("express");
const dotenv = require("dotenv");
const pool = require("./db");
const { body, query, validationResult } = require("express-validator");

dotenv.config();
const app = express();
app.use(express.json());

// Haversine distance (km)
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Add School API
app.post(
  "/addSchool",
  [
    body("name").isString().notEmpty(),
    body("address").isString().notEmpty(),
    body("latitude").isFloat({ min: -90, max: 90 }),
    body("longitude").isFloat({ min: -180, max: 180 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, address, latitude, longitude } = req.body;
    try {
      const [result] = await pool.execute(
        "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
        [name, address, latitude, longitude]
      );
      res.status(201).json({ message: "School added", id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB error" });
    }
  }
);

// List Schools API
app.get(
  "/listSchools",
  [
    query("lat").isFloat({ min: -90, max: 90 }),
    query("lng").isFloat({ min: -180, max: 180 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);

    try {
      const [rows] = await pool.execute("SELECT * FROM schools");
      const sorted = rows
        .map((s) => ({
          ...s,
          distance_km: haversineDistanceKm(
            userLat,
            userLng,
            s.latitude,
            s.longitude
          ).toFixed(2)
        }))
        .sort((a, b) => a.distance_km - b.distance_km);

      res.json({ count: sorted.length, schools: sorted });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB error" });
    }
  }
);

app.get("/", (req, res) => res.send("School Management API running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(` Server running at http://localhost:${PORT}`)
);