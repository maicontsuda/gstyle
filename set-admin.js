/**
 * Script one-time para promover o administrador inicial da loja.
 * Executa: node set-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const ADMIN_EMAIL = 'maicontsuda@gmail.com';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gstyle-motors')
  .then(async () => {
    console.log('✅ Conectado ao MongoDB');

    const user = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      { tipo_usuario: 'admin' },
      { new: true }
    );

    if (!user) {
      console.log(`❌ Usuário com email "${ADMIN_EMAIL}" não encontrado.`);
      console.log('   Faça login no site com esta conta Google primeiro, depois rode este script novamente.');
    } else {
      console.log(`✅ Sucesso! ${user.username} (${user.email}) agora é ADMIN.`);
      console.log(`   tipo_usuario: ${user.tipo_usuario}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  });
