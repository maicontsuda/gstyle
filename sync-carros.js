/**
 * sync-carros.js
 * Lê as pastas locais e insere os carros direto no MongoDB.
 * Usa conexão direta (sem SRV) para funcionar com roteadores japoneses.
 * Como usar: node sync-carros.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const fs   = require('fs');
const path = require('path');
const Carro = require('./src/models/Carro');

const CARROS_DIR = path.join(__dirname, 'carros');
const INFO_FILES = ['informações.txt', 'informacoes.txt', 'info.txt', 'dados.txt'];
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Conexão direta com os hosts do Atlas (sem SRV — resolve o problema de DNS local)
const MONGO_URI = 'mongodb://Vercel-Admin-Gstyle:08kuJANrJq59hdJs@ac-szbtis9-shard-00-00.xaof1vs.mongodb.net:27017,ac-szbtis9-shard-00-01.xaof1vs.mongodb.net:27017,ac-szbtis9-shard-00-02.xaof1vs.mongodb.net:27017/gstyle?ssl=true&authSource=admin';

function parseTxt(content) {
  const lines = content.split('\n').map(l => l.replace(/\r/g, '').trim()).filter(Boolean);
  const data = {
    descricao: '', garantia: '', defeitos: '', modificacoes: '',
    informacoes_adicionais: '', potencia: '', km: 0,
    ano: new Date().getFullYear(), valor: 0, cor: 'A consultar',
    combustivel: 'hibrido', cambio: 'automatico', tipo: 'sedan',
  };
  const descParts = [];

  for (const line of lines) {
    const precoMatch = line.match(/[¥￥][\s]?([\d,]+)/);
    if (precoMatch) { data.valor = parseInt(precoMatch[1].replace(/,/g, ''), 10); continue; }

    const anoMatch = line.match(/(?:ano\s*)?(20[0-2]\d)/i);
    if (anoMatch && /ano/i.test(line)) { data.ano = parseInt(anoMatch[1], 10); continue; }

    const kmMatch = line.match(/(\d[\d.,]*)[\s]*km/i);
    if (kmMatch) { data.km = parseInt(kmMatch[1].replace(/[.,]/g, ''), 10); continue; }

    if (/elétrico|electric|\bev\b/i.test(line))              data.combustivel = 'eletrico';
    else if (/hybrid|híbrido|phev|hev/i.test(line))          data.combustivel = 'hibrido';
    else if (/diesel/i.test(line))                            data.combustivel = 'diesel';
    else if (/gasolina|gasoline/i.test(line))                 data.combustivel = 'gasolina';

    if (/\bcvt\b/i.test(line))                               data.cambio = 'cvt';
    else if (/automátic|automatic|\bat\b/i.test(line))        data.cambio = 'automatico';
    else if (/manual|\bmt\b/i.test(line))                     data.cambio = 'manual';

    if (/\bsuv\b/i.test(line))                               data.tipo = 'suv';
    if (/esportivo|convertible|volante|coupe|roadster/i.test(line)) data.tipo = 'esportivo';
    if (/minivan|\bvan\b/i.test(line))                        data.tipo = 'minivan';
    if (/\bkei\b/i.test(line))                               data.tipo = 'kei';
    if (/\bhatch/i.test(line))                               data.tipo = 'hatch';

    const potMatch = line.match(/\d+[\w\s]*(?:cv|hp|ps|kwh|kw)/i);
    if (potMatch) data.potencia = potMatch[0].trim().substring(0, 50);

    if (/garantia|shaken/i.test(line))                       data.garantia = line.substring(0, 100);
    if (/defeito|avaria|batido|amasso|risco|arranhão/i.test(line)) data.defeitos += line + '\n';
    if (/modificad|aftermarket|rodas|suspension|tuned/i.test(line)) data.modificacoes += line + '\n';

    const corMatch = line.match(/\b(preto|branco|prata|cinza|azul|vermelho|verde|laranja|amarelo|roxo|bege|marrom|dourado|champagne|bronze|vinho)\b/i);
    if (corMatch) data.cor = corMatch[0].charAt(0).toUpperCase() + corMatch[0].slice(1).toLowerCase();

    descParts.push(line);
  }

  data.descricao    = descParts.join('\n').substring(0, 2000);
  data.defeitos     = data.defeitos.trim();
  data.modificacoes = data.modificacoes.trim();
  return data;
}

async function processarCarro(folderPath, status) {
  const folderName = path.basename(folderPath).toUpperCase().trim();
  const parts = folderName.split(/\s+/);

  let anoNome = null;
  if (/^20\d{2}$/.test(parts[parts.length - 1])) anoNome = parseInt(parts.pop(), 10);

  const capitalize = s => s.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  const marca  = capitalize(parts[0]);
  const modelo = capitalize(parts.slice(1).join(' '));

  console.log(`\n📦 ${marca} ${modelo} (${status === 'zero_km' ? '0KM' : 'Seminovo'})`);

  let info = {};
  for (const f of INFO_FILES) {
    const p = path.join(folderPath, f);
    if (fs.existsSync(p)) {
      info = parseTxt(fs.readFileSync(p, 'utf8'));
      console.log(`   📄 Info: ${f}`);
      break;
    }
  }
  if (anoNome) info.ano = anoNome;

  const imageFiles = fs.readdirSync(folderPath)
    .filter(f => IMAGE_EXTS.includes(path.extname(f).toLowerCase()));

  const imagens = imageFiles.map(imgFile => {
    const buf  = fs.readFileSync(path.join(folderPath, imgFile));
    const ext  = path.extname(imgFile).toLowerCase().replace('.', '');
    const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : `image/${ext}`;
    return `data:${mime};base64,${buf.toString('base64')}`;
  });

  console.log(`   🖼️  ${imagens.length} foto(s)${info.valor ? `   💰 ¥${info.valor.toLocaleString()}` : ''}`);

  return {
    marca, modelo,
    ano: info.ano || new Date().getFullYear(),
    km: info.km || 0,
    cor: info.cor || 'A consultar',
    valor: info.valor || 0,
    status,
    tipo: info.tipo || 'sedan',
    combustivel: info.combustivel || 'hibrido',
    cambio: info.cambio || 'automatico',
    potencia: info.potencia || '',
    descricao: info.descricao || '',
    garantia: info.garantia || '',
    defeitos: info.defeitos || '',
    modificacoes: info.modificacoes || '',
    informacoes_adicionais: '',
    imagens,
    concessionaria: 'G-Style Motors',
    destaque: false,
  };
}

(async () => {
  console.log('🚀 G-Style Motors — Sync de Carros');
  console.log('🔌 Conectando ao MongoDB...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 12000 });
  console.log('✅ MongoDB conectado!\n');

  const stats = { adicionados: 0, atualizados: 0, erros: 0 };
  const pastas = [
    { dir: path.join(CARROS_DIR, 'carro zero'), status: 'zero_km' },
    { dir: path.join(CARROS_DIR, 'semi novo'),  status: 'semi_novo' },
  ];

  for (const { dir, status } of pastas) {
    if (!fs.existsSync(dir)) { console.log(`⚠️  Pasta não encontrada: ${dir}`); continue; }
    const subfolders = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory());
    console.log(`📁 "${path.basename(dir)}" — ${subfolders.length} carro(s)`);

    for (const sub of subfolders) {
      try {
        const payload = await processarCarro(path.join(dir, sub), status);
        const existente = await Carro.findOne({
          marca:  new RegExp(`^${payload.marca}$`, 'i'),
          modelo: new RegExp(`^${payload.modelo}$`, 'i'),
          status,
        });

        if (existente) {
          await Carro.findByIdAndUpdate(existente._id, payload);
          console.log(`   🔄 Atualizado!`);
          stats.atualizados++;
        } else {
          await new Carro(payload).save();
          console.log(`   ✅ Adicionado!`);
          stats.adicionados++;
        }
      } catch (err) {
        console.error(`   ❌ Erro:`, err.message.substring(0, 120));
        stats.erros++;
      }
    }
  }

  console.log('\n═══════════════════════════════════');
  console.log(`✅ Adicionados:  ${stats.adicionados}`);
  console.log(`🔄 Atualizados:  ${stats.atualizados}`);
  console.log(`❌ Erros:        ${stats.erros}`);
  console.log('═══════════════════════════════════');

  await mongoose.disconnect();
  console.log('\n✔ Sincronização concluída!');
  process.exit(0);
})();
