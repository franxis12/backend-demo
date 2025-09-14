const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();
app.use(express.json());

// Logging básico para depurar en Render
app.use((req, res, next) => {
  const origin = req.headers.origin || "-";
  console.log(`${req.method} ${req.originalUrl} origin=${origin}`);
  next();
});

// ✅ CORS configurable por variable de entorno
// Usa CORS_ORIGINS=origen1,origen2 (coma-separado). Por defecto permite localhost:5173
const allowedOrigins = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:5173", "https://TU_FRONTEND.vercel.app"]) // reemplaza por tu dominio real
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Forzar cabeceras CORS explícitas
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    // Asegurar comportamiento correcto con caches/CDN
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Respuestas para preflight en cualquier ruta (Express 5 no admite '*')
app.options(/.*/, cors({ origin: allowedOrigins }));

// ========================
// RUTAS
// ========================

// Health check para despliegues
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Raíz (útil si Render tiene el health check en "/")
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", service: "notes-api" });
});

// Obtener todas las notas
app.get(["/notes", "/api/notes"], async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM notes ORDER BY created_at DESC");
    res.status(200).json(results);
  } catch (err) {
    console.error("Error getting notes:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Crear una nueva nota
app.post(["/notes", "/api/notes"], async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const [result] = await db.query("INSERT INTO notes (text) VALUES (?)", [text]);
    res.status(201).json({ id: result.insertId, text });
  } catch (err) {
    console.error("Error saving note:", err);
    res.status(500).json({ error: "Failed to save note" });
  }
});

// Editar una nota
app.put(["/notes/:id", "/api/notes/:id"], async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const [result] = await db.query("UPDATE notes SET text = ? WHERE id = ?", [text, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note updated", id, text });
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ error: "Failed to update note" });
  }
});

// Eliminar una nota
app.delete(["/notes/:id", "/api/notes/:id"], async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM notes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted", id });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// ========================
// INICIAR SERVER
// ========================
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
