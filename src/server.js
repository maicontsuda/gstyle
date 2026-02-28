require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Passport config
require('./config/passport')(passport);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/carros',        require('./routes/carros'));
app.use('/api/servicos',      require('./routes/servicos'));
app.use('/api/financiamento', require('./routes/financiamento'));
app.use('/api/reservas',      require('./routes/reservas'));
app.use('/api/compras',       require('./routes/compras'));
app.use('/api/publicacoes',   require('./routes/publicacoes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Servir arquivos estáticos do React em produção
app.use(express.static(path.join(__dirname, '../client/dist')));

// SPA Fallback: Qualquer rota que não comece com /api vai retornar o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// MongoDB connection
const db = require('./config/database');
mongoose.connect(db.mongoURI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro MongoDB:', err));

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
}

module.exports = app;