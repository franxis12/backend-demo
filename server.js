const express = require("express")
const db = require("./db")
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cors())

db.query("SELECT 1")
  .then(()=> console.log("MySQL Connection successful "))
  .catch(err => console.error("connection error: ", err))

  app.listen(4000, ()=>{
    console.log("Server listen on http://localhost:4000")
})

app.get("/notes", async (req, res) => {
    try{
        const [results] = await db.query("SELECT * FROM notes ORDER BY created_at DESC")

        if(results.length === 0){
            return console.error("Not notes found")
        }
        res.status(200).json(results)

    }catch(err) {
        console.error("Error when getting notes:",  err)

    }
})

app.post("/notes", async (req, res ) => {
    try{

    
    const {text} = req.body

    if(!text) {
        return console.error("Text is required")
    }

    const [result] = await db.query("INSERT INTO notes (text) VALUES (?)  ", [text])

    res.status(201).json({ id: result.insertId, text });
    } catch(err){
        console.error("Error adding new note:", err )
        res.status(500).json({ error: "Error when save note" });
    }
})

app.put("/notes/:id", async (req, res) => {
    try{
    const {id} = req.params;
    const {text} = req.body;

    if(!text) {
        return console.error("Text is required")
    }

    const [results] = await db.query("UPDATE notes SET text = ? WHERE id = ?", [text, id])

    if(results.affectedRows === 0){
        return res.status(404).json({message: "Note non found"})
    }

    res.status(201).json({message: "note update", text, id})
} catch(err){
    console.log(err)
    res.status(404).json({message: "Error trying found note"})
}
})

app.delete("/notes/:id", async (req, res) => {
    try{
        const {id} = req.params;

        const [result] = await db.query("DELETE FROM notes WHERE id = ? ", [id])

        if(result.affectedRows === 0) { 
            return console.error("No notes found")
        }

        res.status(201).json({message: "Notes delete"})

    }catch(err){
        console.log(err)
        res.status(500).json({message:  "Error trying found note"})

    }
})

