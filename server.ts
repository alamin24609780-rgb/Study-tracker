import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("studyflow.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    category TEXT,
    icon TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subject_id INTEGER,
    duration_seconds INTEGER,
    type TEXT, -- 'pomodoro', 'manual', 'random'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'daily', 'weekly', 'monthly'
    target_seconds INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    let user = db.prepare("SELECT * FROM users WHERE name = ?").get(name);
    if (!user) {
      const result = db.prepare("INSERT INTO users (name) VALUES (?)").run(name);
      user = { id: result.lastInsertRowid, name };
      
      // Add default subjects for new users
      const defaultSubjects = [
        { name: 'Physics', category: 'Science', icon: 'Atom' },
        { name: 'Chemistry', category: 'Science', icon: 'FlaskConical' },
        { name: 'Math', category: 'Science', icon: 'Calculator' },
        { name: 'Accounting', category: 'Commerce', icon: 'BookOpen' },
        { name: 'History', category: 'Arts', icon: 'Scroll' }
      ];
      const insertSub = db.prepare("INSERT INTO subjects (user_id, name, category, icon) VALUES (?, ?, ?, ?)");
      defaultSubjects.forEach(s => insertSub.run(user.id, s.name, s.category, s.icon));
    }
    res.json(user);
  });

  app.get("/api/subjects/:userId", (req, res) => {
    const subjects = db.prepare("SELECT * FROM subjects WHERE user_id = ?").all(req.params.userId);
    res.json(subjects);
  });

  app.post("/api/subjects", (req, res) => {
    const { userId, name, category, icon } = req.body;
    const result = db.prepare("INSERT INTO subjects (user_id, name, category, icon) VALUES (?, ?, ?, ?)").run(userId, name, category, icon);
    res.json({ id: result.lastInsertRowid, userId, name, category, icon });
  });

  app.get("/api/sessions/:userId", (req, res) => {
    const sessions = db.prepare(`
      SELECT s.*, sub.name as subject_name, sub.icon as subject_icon 
      FROM study_sessions s 
      JOIN subjects sub ON s.subject_id = sub.id 
      WHERE s.user_id = ? 
      ORDER BY s.created_at DESC
    `).all(req.params.userId);
    res.json(sessions);
  });

  app.post("/api/sessions", (req, res) => {
    const { userId, subjectId, durationSeconds, type } = req.body;
    const result = db.prepare("INSERT INTO study_sessions (user_id, subject_id, duration_seconds, type) VALUES (?, ?, ?, ?)").run(userId, subjectId, durationSeconds, type);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/stats/:userId", (req, res) => {
    const userId = req.params.userId;
    const stats = db.prepare(`
      SELECT 
        SUM(duration_seconds) as total_seconds,
        COUNT(*) as session_count,
        DATE(created_at) as date
      FROM study_sessions 
      WHERE user_id = ? 
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `).all(userId);
    res.json(stats);
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
