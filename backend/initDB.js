// initDb.js
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  try {
    await client.connect();
    console.log("✅ Connected to Neon PostgreSQL");

    await client.query(`
      DROP TABLE IF EXISTS notes;
      DROP TABLE IF EXISTS users;
       DROP TABLE IF EXISTS chats;
    `);

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
        profile_image TEXT DEFAULT NULL,
      );
    `);

    await client.query(`
      CREATE TABLE notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    
    await client.query(`
        CREATE TABLE chat_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) DEFAULT 'New Chat',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);


    await client.query(`
      CREATE TABLE chat_messages (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tables created successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    await client.end();
    console.log("Disconnected from database");
  }
}

initDb();
