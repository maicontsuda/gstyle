const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/scraper/goonet
// @desc    Extrair dados de um veículo do Goo-net
// @access  Private (Admin/Dono/Gerente)
router.post('/goonet', authMiddleware, async (req, res) => {
  try {
    // Verificar permissão
    const roles = ['admin', 'dono', 'gerente'];
    if (!req.user || !roles.includes(req.user.tipo_usuario)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const { url, translate = true } = req.body;
    if (!url || !url.includes('goo-net.com')) {
      return res.status(400).json({ error: 'URL do Goo-net inválida ou não fornecida.' });
    }

    // Função auxiliar para tradução
    const translateText = async (text, from = 'ja', to = 'pt') => {
        if (!text) return '';
        try {
            const trUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
            const res = await axios.get(trUrl);
            if (res.data && res.data[0]) {
                return res.data[0].map(item => item[0]).join('');
            }
        } catch (err) {
            console.error('Translation failed:', err.message);
        }
        return text; 
    };

    // Fazer scraping com Axios (Goo-net geralmente usa EUC-JP)
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    // Tentar decodificar primeiro como EUC-JP, que é o padrão do HTML clássico do Goo-net
    const htmlInfo = iconv.decode(Buffer.from(response.data), 'EUC-JP');
    
    // Carregar cheerio
    const $ = cheerio.load(htmlInfo);

    // Variáveis a extrair
    let marca = '';
    let modelo = '';
    let ano = '';
    let valor = 0;
    let kilometragem = '';
    let cor = '';
    let imagens = [];

    // Título geralmente contém a marca e o modelo na breadcrumb ou tag title
    const tituloFull = $('title').text();
    // Extrair Preço do veículo
    // O Goo-net possui a classe .price_info ou .veh-price_txt
    const priceText = $('.veh-price_txt .price, .price_info .num, th:contains("車両本体価格") + td, th:contains("支払総額") + td, dt:contains("支払総額") + dd').first().text();
    // Exemplo de priceText: "123.4万円", "応談" (sob consulta), "428万円"
    if (priceText) {
       // Convertendo "123.4" 万円 (10.000 yens) para número aproximado
       // Precisamos remover vírgulas se houver
       const cleanPriceStr = priceText.replace(/,/g, '');
       const numMatch = cleanPriceStr.match(/[\d.]+/);
       if (numMatch) {
         if (priceText.includes('万')) {
             valor = Math.round(parseFloat(numMatch[0]) * 10000); // Ex: 123.4 -> 1234000
         } else {
             valor = parseInt(numMatch[0], 10);
         }
       }
    }

    // Extrair Ano (年式)
    const yearText = $('th:contains("年式") + td, .spec_info dl:contains("年式") dd, .spec-data dt:contains("年式") + dd, dt:contains("年式") + dd').first().text();
    if (yearText) {
      // Geralmente vem em era japonesa (ex: 2017(平成29)年)
      const yearMatch = yearText.match(/20\d{2}/) || yearText.match(/19\d{2}/);
      if (yearMatch) {
        ano = yearMatch[0];
      } else {
        ano = yearText.trim(); 
      }
    }

    // Extrair KM (走行距離)
    const kmText = $('th:contains("走行距離") + td, .spec_info dl:contains("走行距離") dd, .spec-data dt:contains("走行") + dd, dt:contains("走行距離") + dd').first().text();
    if (kmText) {
      const cleanKmStr = kmText.replace(/,/g, '');
      const kmNumMatch = cleanKmStr.match(/[\d.]+/);
      if (kmNumMatch) {
         if (kmText.includes('万')) {
             kilometragem = Math.round(parseFloat(kmNumMatch[0]) * 10000).toString();
         } else {
             kilometragem = kmNumMatch[0]; // "40000"
         }
      } else {
         kilometragem = kmText.trim();
      }
    }

    // --- EXTRAÇÃO VIA JSON-LD (DADOS ESTRUTURADOS) ---
    // O Goo-net injeta um objeto schema.org/Car que possui informações precisas
    let jsonLdRaw = null;
    $('script[type="application/ld+json"]').each((i, el) => {
       let content = $(el).html();
       if(content && (content.includes('"@type":"Car"') || content.includes('"@type": "Car"'))) {
          jsonLdRaw = content;
       }
    });

    let jsonModel = '';
    let jsonBrand = '';
    let jsonColor = '';

    if (jsonLdRaw) {
       try {
         const data = JSON.parse(jsonLdRaw);
         // Pode ser um array de blocos LD ou um único objeto
         const item = Array.isArray(data) ? data.find(d => d['@type'] === 'Car' || d['@type'] === 'Product') : data;
         
         if (item) {
            if (item.brand) jsonBrand = item.brand.name || item.brand;
            if (item.model) jsonModel = item.model;
            if (item.color) jsonColor = item.color;
         }
       } catch (e) {
         console.error('JSON-LD parse error:', e.message);
       }
    }

    // Marca e Modelo
    const brandMap = {
      'トヨタ': 'Toyota', 'レクサス': 'Lexus', '日産': 'Nissan', 'ホンダ': 'Honda', 'マツダ': 'Mazda', 'スバル': 'Subaru', 'スズキ': 'Suzuki', '三菱': 'Mitsubishi', 'ダイハツ': 'Daihatsu', 'ＢＭＷ': 'BMW', 'メルセデス・ベンツ': 'Mercedes-Benz', 'アウディ': 'Audi', 'フォルクスワーゲン': 'Volkswagen', 'ポルシェ': 'Porsche', 'ボルボ': 'Volvo', 'ジープ': 'Jeep', 'ランドローバー': 'Land Rover', 'アストンマーティン': 'Aston Martin'
    };
    
    // Tentar achar a marca no JSON, nos breadcrumbs ou no título
    let rawBrand = jsonBrand;

    if (!rawBrand) {
        $('a[href*="/usedcar/brand-"] > span, a[href*="/usedcar/brand-"]').each((i, el) => {
            let text = $(el).text().trim().replace('の中古車', '');
            if (brandMap[text]) rawBrand = text;
        });
    }
    
    if (!rawBrand) {
        for (const jpBrand of Object.keys(brandMap)) {
            if (tituloFull.startsWith(jpBrand)) {
                rawBrand = jpBrand;
                break;
            }
        }
    }

    if (rawBrand) {
        marca = brandMap[rawBrand] || rawBrand;
    }

    if (jsonModel) {
        modelo = jsonModel;
    } else if (rawBrand && tituloFull) {
        const titleParts = tituloFull.replace(rawBrand, '').trim().split(' ');
        if (titleParts.length > 0) modelo = titleParts[0];
    }

    // Cor
    if (jsonColor) {
        cor = jsonColor;
    } else {
        const corText = $('th:contains("色") + td, .spec_table th:contains("車体色") + td, dt:contains("色") + dd').first().text();
        if (corText) cor = corText.trim();
    }

    // Tradução opcional
    if (translate) {
       if (modelo && !modelo.match(/^[a-zA-Z0-9\s-]+$/)) { // Traduzir apenas se tiver caracteres especiais/japoneses
          const translatedModel = await translateText(modelo);
          // Opcional: fazer Letra Maiuscula
          modelo = translatedModel.charAt(0).toUpperCase() + translatedModel.slice(1);
       }
       if (cor && !cor.match(/^[a-zA-Z0-9\s-]+$/)) {
          const translatedColor = await translateText(cor);
          cor = translatedColor.charAt(0).toUpperCase() + translatedColor.slice(1);
       }
    }

    // Imagens
    // As tags <img> normais contém miniaturas ou fotos cortadas (/M/ ou /S/ ou /J/). 
    // As URLs de alta qualidade com barra `/P/` ficam escondidas num bloco <script> de galeria!
    let foundHighRes = false;
    $('script').each((i, el) => {
       let scriptContent = $(el).html();
       if (scriptContent && scriptContent.includes('picture1.goo-net.com') && scriptContent.includes('/P/')) {
           // Usar regex pra caçar todas as URLs da picture1 dentro do script
           const matches = scriptContent.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)*picture1\.goo-net\.com[^"'\s]+/g) || [];
           matches.forEach(m => {
               // Filtrar apenas as JPGs de qualidade P (ou J que seja do carrossel principal)
               if (m.includes('.jpg') && !m.includes('blank')) {
                   // Forçar /P/ se por acaso for /S/ ou /J/ no meio
                   let highResUrl = m.replace(/\/S\//g, '/P/').replace(/\/J\//g, '/P/').replace(/\/M\//g, '/P/');
                   if (!imagens.includes(highResUrl)) {
                       imagens.push(highResUrl);
                       foundHighRes = true;
                   }
               }
           });
       }
    });

    // Fallback pra <img> se o script falhar
    if (!foundHighRes) {
        $('img[src*="picture1.goo-net.com"]').each((i, el) => {
            let src = $(el).attr('data-src') || $(el).attr('src');
            if (src && src.includes('.jpg') && !src.includes('blank')) {
                if (src.startsWith('//')) src = 'https:' + src;
                src = src.replace(/\/S\//g, '/P/').replace(/\/J\//g, '/P/').replace(/\/M\//g, '/P/').replace(/\/thum\//g, '/normal/');
                if (!imagens.includes(src)) {
                    imagens.push(src);
                }
            }
        });
    }

    // --- EQUIPAMENTOS / OPCIONAIS ---
    let equipamentosRaw = [];
    
    // Buscar equipamentos explicitamente listados como ativos ('on') ou em textos com keywords japonesas
    $('.equipList li.on, .equip-list li.is-active, .eq_icon_box li, .optionList li').each((i, el) => {
        let txt = $(el).text().trim();
        if(txt) equipamentosRaw.push(txt);
    });

    // Se a página não tiver estrutura clara de "ativos", procurar "hardcoded" nas LIs
    if (equipamentosRaw.length === 0) {
        const keywords = ['エアコン', 'パワステ', 'パワーウィンドウ', 'サンルーフ', '本革シート', 'ナビ', 'バックカメラ', 'エアバッグ', 'ETC', 'スマートキー', 'シートヒーター'];
        $('li, td').each((i, el) => {
            let text = $(el).text().trim();
            if(!$(el).hasClass('off') && !$(el).hasClass('inactive')) {
                // Verificar se o texto tem as keywords e é curto (não é uma descrição de 5 linhas)
                if (text.length < 25 && keywords.some(kw => text.includes(kw))) {
                     equipamentosRaw.push(text.replace(/\s+/g,' '));
                }
            }
        });
    }

    // Tirar cópias repetidas e limitar
    equipamentosRaw = [...new Set(equipamentosRaw)];
    let equipamentos = [];

    // Tentar traduzir as "keywords" principais para checagem rápida no Frontend
    // E traduzir o texto literal para customizados
    if (translate && equipamentosRaw.length > 0) {
        // Mapa Estático para itens fáceis
        const eqMap = {
            'エアコン': 'Ar Condicionado',
            'パワステ': 'Direção Hidráulica',
            'パワーウィンドウ': 'Vidros Elétricos',
            'サンルーフ': 'Teto Solar',
            '本革シート': 'Bancos de Couro',
            'ナビ': 'Navegação GPS',
            'バックカメラ': 'Câmera de Ré',
            'ETC': 'ETC',
            'スマートキー': 'Chave Presencial',
            'シートヒーター': 'Aquecimento de Bancos',
            'クルーズコントロール': 'Piloto Automático'
        };

        for (let eqJp of equipamentosRaw) {
            let mapped = false;
            for (const [jpKey, ptVal] of Object.entries(eqMap)) {
                if (eqJp.includes(jpKey)) {
                    if(!equipamentos.includes(ptVal)) equipamentos.push(ptVal);
                    mapped = true;
                }
            }
            if (!mapped) {
                 // Usar api para os não mapeados
                 const tr = await translateText(eqJp);
                 if (tr && tr !== eqJp && !equipamentos.includes(tr)) {
                     // Capitalize
                     equipamentos.push(tr.charAt(0).toUpperCase() + tr.slice(1));
                 }
            }
        }
    } else {
        equipamentos = equipamentosRaw; // Mantem os JP originais se translate=false
    }


    res.json({
        marca: marca || 'Toyota', // Fallback default
        modelo: modelo || tituloFull.split(' ')[1] || 'Modelo Importado',
        ano,
        valor,
        kilometragem,
        cor,
        imagens, 
        equipamentos,
        linkOriginal: url
    });

  } catch (err) {
    console.error('[Scraper Error]', err);
    res.status(500).json({ error: 'Erro ao extrair informações. Tente com outro link ou verifique a URL.', details: err.message });
  }
});

module.exports = router;
