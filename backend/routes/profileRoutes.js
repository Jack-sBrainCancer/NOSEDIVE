// backend/routes/profileRoutes.js
const express = require('express');
const multer = require('multer');
const Profile = require('../models/Profile');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Pasta para armazenar imagens

// Criar perfil
router.post('/profiles', async (req, res) => {
  const { name, bio } = req.body;
  const profile = new Profile({ name, bio, images: [] });
  await profile.save();
  res.status(201).json(profile);
});

// Fazer upload de imagem
router.post('/profiles/:id/upload', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const image = {
    src: req.file.path, // Caminho da imagem armazenada
    ratings: 0
  };
  const profile = await Profile.findById(id);
  if (!profile) {
    return res.status(404).send('Perfil não encontrado');
  }
  profile.images.push(image);
  await profile.save();
  res.status(200).json(profile);
});

// Obter todos os perfis
router.get('/profiles', async (req, res) => {
  const profiles = await Profile.find();
  res.status(200).json(profiles);
});

// Obter um perfil pelo ID
router.get('/profiles/:id', async (req, res) => {
  const profile = await Profile.findById(req.params.id);
  if (!profile) {
    return res.status(404).send('Perfil não encontrado');
  }
  res.status(200).json(profile);
});

module.exports = router;
