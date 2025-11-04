import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import multer from "multer";
// import fileUpload from "express-fileupload";
// import fs from "fs";
import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";
// import pkg from "pdf-parse";
// const pdf = pkg;
// import pdfToText from "react-pdftotext";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { verifyToken } from "./middleware/verifytoken.js";


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
// app.use(fileUpload());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ dest: "uploads/" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/notes/add", verifyToken, async (req, res) => {
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

app.post("/api/notes/get", verifyToken,async (req, res) => {
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

app.get("/api/notes/:id", verifyToken,async (req, res) => {
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

app.put("/api/notes/:id", verifyToken,async (req, res) => {
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

app.delete("/api/notes/:id", verifyToken,async (req, res) => {
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


let pdfText = ""; 


app.post("/api/upload_pdf", verifyToken,upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // const { default: pdf } = await import("pdf-parse");
    const filePath = req.file.path;
    const parser = new PDFParse({ url: filePath });
    console.log("Processing file:", filePath);

    // const dataBuffer = await fs.readFile(filePath);
    // const data = await pdf(dataBuffer);
    const result = await parser.getText();

    pdfText = result.text;
    await fs.unlink(filePath);

    console.log("PDF processed successfully.");
    res.json({ message: "PDF uploaded and processed successfully!" });

  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: error.message || "Error processing PDF" });
  }
});

// app.post("/api/ask_question", async (req, res) => {
//   const { question } = req.body;
//   if (!pdfText) {
//     return res.status(400).json({ error: "No PDF uploaded yet." });
//   }

//   try {
  
//     const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-pro" });

//     const prompt = `
// You are an assistant that answers questions based on PDF content.
// PDF content: """${pdfText.substring(0, 15000)}""" 
// Question: ${question}
// Answer:
// `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response.text();
//     res.json({ answer: response });
//   } catch (error) {
//     console.error("Error generating answer:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

app.post("/api/ask_question",verifyToken, async (req, res) => {
  const { user_id, session_id, question } = req.body;

  if (!pdfText) {
    return res.status(400).json({ error: "No PDF uploaded yet." });
  }
  if (!user_id || !session_id || !question) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-pro" });

    const prompt = `
You are an assistant that answers questions based on PDF content.
PDF content: """${pdfText.substring(0, 15000)}""" 
Question: ${question}
Answer:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

   
    await pool.query(
      `INSERT INTO chat_messages (session_id, question, answer) VALUES ($1, $2, $3)`,
      [session_id, question, response]
    );

    res.json({ answer: response });
  } catch (error) {
    console.error("Error generating answer:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chats/session/create",verifyToken, async (req, res) => {
  try {
    const { user_id, title } = req.body;

    if (!user_id) return res.status(400).json({ error: "Missing user_id" });

    const result = await pool.query(
      `INSERT INTO chat_sessions (user_id, title)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, title || "New Chat"]
    );

    res.status(201).json({
      message: "Chat session created successfully",
      session: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating chat session:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/chats/:user_id", verifyToken,async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, title, created_at 
       FROM chat_sessions 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/chats/session/:session_id", verifyToken,async (req, res) => {
  try {
    const { session_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [session_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching chat messages:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/api/chats/session/:session_id", verifyToken,async (req, res) => {
  try {
    const { session_id } = req.params;

    const result = await pool.query(
      `DELETE FROM chat_sessions WHERE id = $1`,
      [session_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({ message: "Chat session deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat session:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/users/:id",verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, email,password, profile_image
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/api/users/:id", verifyToken,upload.single("profile_image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, password } = req.body;
    let imageUrl = null;

   
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "user_profiles",
      });
      imageUrl = uploadResult.secure_url;
      await fs.unlink(req.file.path);
    }


    const fields = [];
    const values = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push(`password = $${idx++}`);
      values.push(hashedPassword);
    }

    if (imageUrl) {
      fields.push(`profile_image = $${idx++}`);
      values.push(imageUrl);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const query = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id, name, email, profile_image
    `;

    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/users/:id/request-password-change",verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [id]
    );

    if (userResult.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const email = userResult.rows[0].email;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "INSERT INTO password_resets (user_id, code, expires_at) VALUES ($1, $2, $3)",
      [id, code, expiresAt]
    );

    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Change Verification Code",
      html: `
        <h2>Password Change Request</h2>
        <p>Your verification code is: <b>${code}</b></p>
        <p>This code expires in 10 minutes.</p>
      `,
    });

    res.json({ message: "Verification code sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/users/:id/verify-password-change", verifyToken,async (req, res) => {
  try {
    const { id } = req.params;
    const { code, newPassword } = req.body;

    const result = await pool.query(
      "SELECT * FROM password_resets WHERE user_id = $1 AND code = $2 ORDER BY id DESC LIMIT 1",
      [id, code]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid code" });

    const reset = result.rows[0];
    if (new Date(reset.expires_at) < new Date())
      return res.status(400).json({ error: "Code expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      id,
    ]);

    await pool.query("DELETE FROM password_resets WHERE user_id = $1", [id]);

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
});
