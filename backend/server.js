const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('uploads')); // Serve arquivos estáticos na pasta uploads

// Conectar ao MongoDB
mongoose.connect('mongodb://nosedive-5nwn.onrender.com/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use('/api', profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
