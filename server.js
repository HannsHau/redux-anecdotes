import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3002;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');
const dbPath = path.join(__dirname, 'db.json');

app.use(express.json());
app.use(express.static(distPath));

const readDb = async () => {
  const raw = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(raw);
};

const writeDb = async (data) => {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
};

app.get('/api/anecdotes', async (req, res) => {
  const db = await readDb();
  res.json(db.anecdotes);
});

app.post('/api/anecdotes', async (req, res) => {
  const db = await readDb();

  const newAnecdote = {
    id: String(Date.now()),
    content: req.body.content,
    votes: 0,
  };

  db.anecdotes.push(newAnecdote);
  await writeDb(db);

  res.status(201).json(newAnecdote);
});

app.put('/api/anecdotes/:id', async (req, res) => {
  const db = await readDb();
  const id = req.params.id;

  const updatedAnecdotes = db.anecdotes.map(a =>
    a.id === id ? { ...a, content: req.body.content, votes: req.body.votes } : a
  );

  const updated = updatedAnecdotes.find(a => a.id === id);

  if (!updated) {
    return res.status(404).json({ error: 'Anecdote not found' });
  }

  db.anecdotes = updatedAnecdotes;
  await writeDb(db);

  res.json(updated);
});

app.get('/version', (req, res) => {
  res.send('0.0.0 initial running') // change this string to ensure a new version deployed
})

app.get('/health', (req, res) => {
  res.send('ok')
})

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});