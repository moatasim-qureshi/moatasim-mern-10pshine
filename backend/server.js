const express = require("express");
const pg = require("pg");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const pdf = require("pdf-parse");
const OpenAI = require("openai");

dotenv.config();
const { Pool } = pg;

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// --- PostgreSQL Connection ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const upload = multer({ dest: "uploads/" });

app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (userResult.rows.length === 0)
      return res.status(400).json({ message: "Invalid email or password" });

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/notes/add", async (req, res) => {
  try {
    
    const { title, description, user_id } = req.body;
    console.log(title, description, user_id);

    if (!title || !description || !user_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO notes (title, description, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, user_id]
    );

    res.status(201).json({
      message: "Note added successfully",
      note: result.rows[0],
    });
  } catch (err) {
    console.error("Error adding note:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/notes/get", async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const result = await pool.query(
      `SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`SELECT * FROM notes WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching note:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = await pool.query(
      `UPDATE notes
       SET title = $1, description = $2
       WHERE id = $3
       RETURNING *`,
      [title, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note updated successfully", note: result.rows[0] });
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`DELETE FROM notes WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/pdf-chat", upload.single("file"), async (req, res) => {
    console.log("Incoming request...");
    console.log("File:", req.file);
    console.log("Message:", req.body.message);
  try {
    const { message } = req.body;
    const filePath = req.file.path;

    if (!message || !filePath) {
      return res.status(400).json({ error: "PDF file and message are required" });
    }

    // Extract text from PDF
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdf(pdfBuffer);
    const pdfText = data.text.substring(0, 15000); // Limit to avoid token overflow

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that answers questions based on PDF content.",
        },
        {
          role: "user",
          content: `PDF Content:\n${pdfText}\n\nQuestion: ${message}`,
        },
      ],
    });

    const answer = completion.choices[0].message.content;
    fs.unlinkSync(filePath); // delete uploaded PDF after processing

    res.json({ answer });
  } catch (err) {
    console.error("Error in /api/pdf-chat:", err);
    res.status(500).json({ error: "Failed to process PDF" });
  }
});

const PORT = 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
});
