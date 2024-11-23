const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do SQLite
const db = new sqlite3.Database('./profiles.db', (err) => {
  if (err) {
    console.error(err.message);
  }
});

// Criação da tabela se não existir
db.run(`CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT,
    bio TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profileId TEXT,
    image TEXT,
    FOREIGN KEY (profileId) REFERENCES profiles(id)
)`);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('uploads')); // Para servir imagens

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Renomeia o arquivo
  }
});
const upload = multer({ storage });

// Rota para criar perfil
app.post('/api/profiles', (req, res) => {
  const { id, name, bio } = req.body;
  db.run(`INSERT INTO profiles (id, name, bio) VALUES (?, ?, ?)`, [id, name, bio], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id, name, bio });
  });
});

// Rota para fazer upload de imagem
app.post('/api/uploads', upload.single('image'), (req, res) => {
  const { profileId } = req.body;
  const image = req.file.path;
  db.run(`INSERT INTO uploads (profileId, image) VALUES (?, ?)`, [profileId, image], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ profileId, image });
  });
});

// Rota para buscar perfil por ID
app.get('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM profiles WHERE id = ?`, [id], (err, profile) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!profile) {
      return res.status(404).json({ message: 'Perfil não encontrado' });
    }

    // Buscar uploads do perfil
    db.all(`SELECT * FROM uploads WHERE profileId = ?`, [id], (err, uploads) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ profile, uploads });
    });
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em https://nosedive-5nwn.onrender.com:${PORT}`);
});
