import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("Raw response:\n", data);

    if (data.models && Array.isArray(data.models)) {
      console.log("\nAvailable Models:\n");
      data.models.forEach((model) => {
        console.log(`${model.name} — ${model.displayName || ""}`);
      });
    } else {
      console.warn("\nNo models found or invalid response structure.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

listModels();
