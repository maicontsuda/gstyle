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
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(passport.initialize());

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/carros',        require('./routes/carros'));
app.use('/api/zerokm',        require('./routes/zerokm'));
app.use('/api/upload',        require('./routes/upload'));
app.use('/api/sync',          require('./routes/sync'));
app.use('/api/servicos',      require('./routes/servicos'));
app.use('/api/financiamento', require('./routes/financiamento'));
app.use('/api/reservas',      require('./routes/reservas'));
app.use('/api/compras',       require('./routes/compras'));
app.use('/api/publicacoes',   require('./routes/publicacoes'));
app.use('/api/config',        require('./routes/config'));
app.use('/api/scraper',       require('./routes/scraper'));
app.use('/api/ai-scraper',   require('./routes/ai-scraper'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Serve React SPA static files
app.use(express.static(path.join(__dirname, '../client/dist')));

const fs = require('fs');
const Carro = require('./models/Carro');

// Interceptar rota do veículo para injetar Meta Tags (Open Graph) para Bots
app.get('/veiculo/:id', async (req, res, next) => {
  try {
    const ua = req.headers['user-agent'] || '';
    const isBot = /bot|facebookexternalhit|whatsapp|google|telegram|twitter|linkedin|skype|slack/i.test(ua);
    
    if (!isBot) {
      // Se não for um bot de rede social, deixa o SPA lidar com a rota normalmente
      return next();
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next();
    
    const carro = await Carro.findById(req.params.id);
    if (!carro) return next();

    const title = `${carro.marca} ${carro.modelo} - G-Style Motors`;
    const formatPrice = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(carro.valor);
    const kmText = carro.km === 0 ? 'Zero km' : carro.km.toLocaleString('ja-JP') + ' km';
    const description = `Ano: ${carro.ano} | KM: ${kmText} | Valor: ${formatPrice}`;
    
    let imageUrl = 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=900&q=80';
    if (carro.imagens && carro.imagens.length > 0) {
      const firstMedia = carro.imagens[0];
      // Se for um vídeo do Cloudinary, trocamos a extensão para .jpg para pegar a thumbnail gerada automaticamente
      if (firstMedia.match(/\.(mp4|webm|mov)(\?|$)/i)) {
        imageUrl = firstMedia.replace(/\.(mp4|webm|mov)(\?|$)/i, '.jpg$2');
      } else {
        imageUrl = firstMedia;
      }
    }

    const currentUrl = `https://${req.get('host')}${req.originalUrl}`;

    const rawHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${currentUrl}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
  </head>
  <body>
    <h1>${title}</h1>
    <p>${description}</p>
    <img src="${imageUrl}" alt="${title}" />
  </body>
</html>`;

    return res.send(rawHtml);
  } catch (error) {
    console.error('Erro na injeção OG:', error);
    next();
  }
});

// SPA Fallback - all non-API routes return index.html
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