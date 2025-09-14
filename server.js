const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(express.json());

// ✅ CORS configurado para desarrollo local y producción (Vercel)
app.use(cors({
  origin: ["http://localhost:5173", "https://TU_FRONTEND.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// ========================
// RUTAS
// ========================

// Obtener todas las notas
app.get("/notes", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM notes ORDER BY created_at DESC");
    res.status(200).json(results);
  } catch (err) {
    console.error("Error getting notes:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Crear una nueva nota
app.post("/notes", async (req, res) => {
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
app.put("/notes/:id", async (req, res) => {
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
app.delete("/notes/:id", async (req, res) => {
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
app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});