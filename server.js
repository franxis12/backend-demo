const express = require("express");
const db = require("./db");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'https://tu-app-frontend-en-vercel.vercel.app'],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Verificar conexión
db.query("SELECT 1")
  .then(() => console.log("✅ MySQL Connection successful"))
  .catch(err => console.error("❌ Connection error:", err));

// Rutas
app.get("/notes", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM notes ORDER BY created_at DESC");
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

app.post("/notes", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const [result] = await db.query("INSERT INTO notes (text) VALUES (?)", [text]);
    res.status(201).json({ id: result.insertId, text });
  } catch (err) {
    res.status(500).json({ error: "Error saving note" });
  }
});

app.put("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: "Text is required" });

    const [results] = await db.query("UPDATE notes SET text = ? WHERE id = ?", [text, id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note updated", text, id });
  } catch (err) {
    res.status(500).json({ message: "Error updating note" });
  }
});

app.delete("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM notes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting note" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});