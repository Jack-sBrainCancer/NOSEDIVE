// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Armazenamento em memória para perfis
let profiles = [];

// Rota para criar um novo perfil
app.post('/api/profiles', (req, res) => {
  const { name, bio } = req.body;
  const newProfile = { id: profiles.length + 1, name, bio };
  profiles.push(newProfile);
  res.status(201).send(newProfile);
});

// Rota para obter todos os perfis
app.get('/api/profiles', (req, res) => {
  res.status(200).send(profiles);
});

// Rota para obter um perfil pelo ID
app.get('/api/profiles/:id', (req, res) => {
  const profile = profiles.find(p => p.id === parseInt(req.params.id));
  if (!profile) return res.status(404).send('Perfil não encontrado');
  res.send(profile);
});

// Definir a porta a partir das variáveis de ambiente ou usar 8080 como padrão
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
