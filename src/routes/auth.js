const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/database');

// @route  GET /api/auth/google
// Inicia fluxo OAuth com Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// @route  GET /api/auth/google/callback
// Callback após autenticação Google
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?erro=auth` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, jwtSecret, { expiresIn: '7d' });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  }
);

// @route  GET /api/auth/me
// Retorna o usuário logado (requer token)
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
  const User = require('../models/User');
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
});

// @route  GET /api/auth/logout
router.get('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso.' });
});

module.exports = router;
