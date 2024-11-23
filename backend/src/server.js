const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do SQLite
const db = new sqlite3.Database('./profiles.db', (err) => {
  if (err) {
    console.error(err.message);
  }
});

// Criação das tabelas se não existirem
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

db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profileId TEXT,
    content TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
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

// Rota para criar uma postagem
app.post('/api/posts', (req, res) => {
  const { profileId, content } = req.body;
  db.run(`INSERT INTO posts (profileId, content) VALUES (?, ?)`, [profileId, content], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, profileId, content, createdAt: new Date() });
  });
});

// Rota para recuperar todas as postagens
app.get('/api/posts', (req, res) => {
  db.all(`SELECT p.*, pr.name FROM posts p JOIN profiles pr ON p.profileId = pr.id ORDER BY createdAt DESC`, [], (err, posts) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(posts);
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

// Iniciar o servidor Express
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Configurar WebSocket
const wss = new WebSocketServer({ server });
const users = new Map(); // Para armazenar usuários conectados

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  // Evento de mensagem recebida
  ws.on("message", (data) => {
    const message = JSON.parse(data);

    // Se for uma nova conexão
    if (message.event === "user_connected") {
      const { userName, userId } = message;
      users.set(userId, userName); // Adiciona o usuário à lista

      // Enviar a notificação para todos os clientes
      const userConnectedMessage = JSON.stringify({
        event: "user_connected",
        userName: userName,
        userId: userId,
      });
      broadcast(userConnectedMessage);
    } else {
      // Caso contrário, é uma mensagem normal
      broadcast(data.toString());
    }
  });

  // Remover o usuário quando desconectar
  ws.on("close", () => {
    users.forEach((userName, userId) => {
      if (ws === userId) {
        users.delete(userId);

        const userDisconnectedMessage = JSON.stringify({
          event: "user_disconnected",
          userName: userName,
          userId: userId,
        });
        broadcast(userDisconnectedMessage);
      }
    });
  });

  console.log("Cliente conectado");
});

// Função para enviar mensagens para todos os clientes
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}
