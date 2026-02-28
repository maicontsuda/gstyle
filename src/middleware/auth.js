const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/database');
const User = require('../models/User');

// Auth middleware that also attaches tipo_usuario from DB so role changes
// take effect without requiring the user to log out and back in.
module.exports = async function(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    // Fetch fresh user from DB to get latest tipo_usuario
    const user = await User.findById(decoded.id).select('_id email tipo_usuario');
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });
    req.user = { id: user._id.toString(), email: user.email, tipo_usuario: user.tipo_usuario };
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
};
