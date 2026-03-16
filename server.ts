import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("usage.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS usage (
    email TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0,
    max_limit INTEGER DEFAULT 50
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/usage", (req, res) => {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: "Email is required" });

    let user = db.prepare("SELECT * FROM usage WHERE email = ?").get(email) as any;
    
    if (!user) {
      db.prepare("INSERT INTO usage (email, count, max_limit) VALUES (?, 0, 50)").run(email);
      user = { email, count: 0, max_limit: 50 };
    }

    res.json(user);
  });

  app.post("/api/usage/increment", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = db.prepare("SELECT * FROM usage WHERE email = ?").get(email) as any;
    
    if (!user) {
      db.prepare("INSERT INTO usage (email, count, max_limit) VALUES (?, 1, 50)").run(email);
      return res.json({ email, count: 1, max_limit: 50 });
    }

    if (user.count >= user.max_limit) {
      return res.status(403).json({ error: "Limit reached" });
    }

    db.prepare("UPDATE usage SET count = count + 1 WHERE email = ?").run(email);
    res.json({ ...user, count: user.count + 1 });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
