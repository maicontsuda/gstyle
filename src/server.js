const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const carrosRoutes = require('./routes/carros');
const servicosRoutes = require('./routes/servicos');
const financiamentoRoutes = require('./routes/financiamento');
const reservasRoutes = require('./routes/reservas');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/carros', carrosRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/financiamento', financiamentoRoutes);
app.use('/api/reservas', reservasRoutes);

// MongoDB connection
const db = require('./config/database');

mongoose.connect(db.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));