/**
 * sync-carros.js
 * 
 * Envia os carros das pastas locais para o MongoDB via API do site.
 * Não precisa de credenciais do MongoDB — usa a API do Vercel.
 * 
 * Estrutura das pastas:
 *   carros/
 *     semi novo/
 *       ASTON MARTIN DB11/
 *         informações.txt
 *         foto1.jpg
 *     carro zero/
 *       TOYOTA PRIUS AX 2024/
 *         informações.txt
 *         foto1.jpg
 * 
 * Como usar:
 *   node sync-carros.js
 */

const fs   = require('fs');
const path = require('path');
const http = require('https');

// ── Configurações ─────────────────────────────────────────────────────────
const API_BASE   = 'https://gstyle2.vercel.app/api'; // URL do seu site
const SYNC_KEY   = 'gstyle-sync-2024';               // Chave secreta (tem que bater com server)
const CARROS_DIR = path.join(__dirname, 'carros');
const INFO_FILES = ['informações.txt', 'informacoes.txt', 'info.txt', 'dados.txt'];
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// ── Função de requisição HTTP ─────────────────────────────────────────────
function apiPost(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url  = new URL(`${API_BASE}${endpoint}`);

    const options = {
      hostname: url.hostname,
      path:     url.pathname,
      method:   'POST',
      headers: {
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(data),
        'x-sync-key':    SYNC_KEY
      }
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── Parser do informações.txt ─────────────────────────────────────────────
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
    // Preço
    const precoMatch = line.match(/[¥￥][\s]?([\d,]+)/);
    if (precoMatch) { data.valor = parseInt(precoMatch[1].replace(/,/g, ''), 10); continue; }

    // Ano
    const anoMatch = line.match(/(?:ano\s*)?(20[0-2]\d)/i);
    if (anoMatch && /ano/i.test(line)) { data.ano = parseInt(anoMatch[1], 10); continue; }

    // KM
    const kmMatch = line.match(/(\d[\d.,]*)[\s]*km/i);
    if (kmMatch) { data.km = parseInt(kmMatch[1].replace(/[.,]/g, ''), 10); continue; }

    // Combustível
    if (/elétrico|electric|\bev\b|100%\s*ev/i.test(line))  { data.combustivel = 'eletrico'; }
    else if (/hybrid|híbrido|phev|hev/i.test(line))         { data.combustivel = 'hibrido'; }
    else if (/diesel/i.test(line))                           { data.combustivel = 'diesel'; }
    else if (/gasolina|gasoline/i.test(line))                { data.combustivel = 'gasolina'; }

    // Câmbio
    if (/\bcvt\b/i.test(line))                              { data.cambio = 'cvt'; }
    else if (/automátic|automatic|\bat\b/i.test(line))      { data.cambio = 'automatico'; }
    else if (/manual|\bmt\b/i.test(line))                   { data.cambio = 'manual'; }

    // Tipo
    if (/\bsuv\b/i.test(line))                              data.tipo = 'suv';
    if (/esportivo|convertible|volante|coupe|roadster/i.test(line)) data.tipo = 'esportivo';
    if (/minivan|\bvan\b/i.test(line))                      data.tipo = 'minivan';
    if (/\bkei\b/i.test(line))                              data.tipo = 'kei';
    if (/\bhatch/i.test(line))                              data.tipo = 'hatch';

    // Potência
    const potMatch = line.match(/\d+[\w\s]*(?:cv|hp|ps|kwh|kw)/i);
    if (potMatch) data.potencia = potMatch[0].trim().substring(0, 50);

    // Garantia / Shaken
    if (/garantia|shaken/i.test(line)) data.garantia = line.substring(0, 100);

    // Defeitos
    if (/defeito|avaria|batido|amasso|risco|arranhão|dano/i.test(line)) data.defeitos += line + '\n';

    // Modificações
    if (/modificad|aftermarket|rodas|suspension|sport exhaust|tuned|kit/i.test(line)) data.modificacoes += line + '\n';

    // Cor
    const corMatch = line.match(/\b(preto|branco|prata|cinza|azul|vermelho|verde|laranja|amarelo|roxo|bege|marrom|dourado|champagne|bronze|vinho)\b/i);
    if (corMatch) data.cor = corMatch[0].charAt(0).toUpperCase() + corMatch[0].slice(1).toLowerCase();

    descParts.push(line);
  }

  data.descricao     = descParts.join('\n').substring(0, 2000);
  data.defeitos      = data.defeitos.trim();
  data.modificacoes  = data.modificacoes.trim();
  return data;
}

// ── Processar uma pasta de carro ──────────────────────────────────────────
async function processarCarro(folderPath, status) {
  const folderName = path.basename(folderPath).toUpperCase().trim();
  const parts = folderName.split(/\s+/);

  let anoNome = null;
  if (/^20\d{2}$/.test(parts[parts.length - 1])) anoNome = parseInt(parts.pop(), 10);

  const marcaRaw  = parts[0];
  const modeloRaw = parts.slice(1).join(' ');

  const capitalize = s => s.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  const marca  = capitalize(marcaRaw);
  const modelo = capitalize(modeloRaw);

  console.log(`\n📦 ${marca} ${modelo} (${status === 'zero_km' ? '0KM' : 'Seminovo'})`);

  // Ler informações
  let info = {};
  for (const f of INFO_FILES) {
    const p = path.join(folderPath, f);
    if (fs.existsSync(p)) {
      info = parseTxt(fs.readFileSync(p, 'utf8'));
      console.log(`   📄 Lendo: ${f}`);
      break;
    }
  }
  if (anoNome) info.ano = anoNome;

  // Converter imagens para base64
  const imageFiles = fs.readdirSync(folderPath)
    .filter(f => IMAGE_EXTS.includes(path.extname(f).toLowerCase()));

  const imagens = imageFiles.map(imgFile => {
    const buf  = fs.readFileSync(path.join(folderPath, imgFile));
    const ext  = path.extname(imgFile).toLowerCase().replace('.', '');
    const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : `image/${ext}`;
    return `data:${mime};base64,${buf.toString('base64')}`;
  });

  console.log(`   🖼️  ${imagens.length} foto(s)`);
  if (info.valor) console.log(`   💰 ¥${info.valor.toLocaleString()}`);

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
    informacoes_adicionais: info.informacoes_adicionais || '',
    imagens,
    concessionaria: 'G-Style Motors',
    destaque: false,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────
(async () => {
  console.log('🚀 G-Style Motors — Sync de Carros');
  console.log(`🌐 API: ${API_BASE}\n`);

  const stats = { adicionados: 0, atualizados: 0, erros: 0 };

  const pastas = [
    { dir: path.join(CARROS_DIR, 'carro zero'), status: 'zero_km',  endpoint: '/sync/carro' },
    { dir: path.join(CARROS_DIR, 'semi novo'),  status: 'semi_novo', endpoint: '/sync/carro' },
  ];

  for (const { dir, status, endpoint } of pastas) {
    if (!fs.existsSync(dir)) { console.log(`⚠️  Pasta não encontrada: ${dir}`); continue; }

    const subfolders = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory());
    console.log(`\n📁 "${path.basename(dir)}" — ${subfolders.length} carro(s)`);

    for (const sub of subfolders) {
      try {
        const payload = await processarCarro(path.join(dir, sub), status);
        const res = await apiPost(endpoint, payload);

        if (res.status === 201) {
          console.log(`   ✅ Adicionado!`);
          stats.adicionados++;
        } else if (res.status === 200) {
          console.log(`   🔄 Atualizado!`);
          stats.atualizados++;
        } else {
          console.log(`   ❌ Erro ${res.status}:`, res.body?.error || res.body);
          stats.erros++;
        }
      } catch (err) {
        console.error(`   ❌ Falha:`, err.message);
        stats.erros++;
      }
    }
  }

  console.log('\n═══════════════════════════════════');
  console.log(`✅ Adicionados:  ${stats.adicionados}`);
  console.log(`🔄 Atualizados:  ${stats.atualizados}`);
  console.log(`❌ Erros:        ${stats.erros}`);
  console.log('═══════════════════════════════════\n');
  console.log('✔ Sincronização concluída!');
})();
