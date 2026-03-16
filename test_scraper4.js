const fs = require('fs');
const cheerio = require('cheerio');

try {
  const htmlInfo = fs.readFileSync('goonet_dump.html', 'utf-8');
  const $ = cheerio.load(htmlInfo);
  const title = $('title').text();
  console.log('Title:', title);

  // New Strategy for Brand and Model 
  // Na maioria das vezes, o Goo-net tem um block script JSON-LD com os dados estruturados!
  let jsonLdRaw = null;
  $('script[type="application/ld+json"]').each((i, el) => {
     let c = $(el).html();
     if(c.includes('Car') || c.includes('Vehicle') || c.includes('brand')) {
        jsonLdRaw = c;
     }
  });

  if (jsonLdRaw) {
     console.log('Found Structured Data! Trying to parse...');
     try {
       // Muitas vezes o JSON-LD tem arrays ou erros, limpamos:
       const data = JSON.parse(jsonLdRaw);
       let item = Array.isArray(data) ? data.find(d => d['@type'] === 'Car' || d['@type'] === 'Product' || d.brand) : data;
       
       if (item) {
          console.log('--- JSON-LD Data ---');
          if (item.brand) console.log('Brand:', item.brand.name || item.brand);
          if (item.model) console.log('Model:', item.model);
          if (item.color) console.log('Color:', item.color);
          if (item.image) console.log('Image:', item.image);
       }
     } catch (err) {
       console.log('Error parsing JSON-LD:', err.message);
     }
  }

  console.log('--- EXTRACTING FROM TITLE OR BREADCRUMBS ---');
  // Fallback map
  const brandMap = {
      'トヨタ': 'Toyota', 'レクサス': 'Lexus', '日産': 'Nissan', 'ホンダ': 'Honda', 
      'マツダ': 'Mazda', 'スバル': 'Subaru', 'スズキ': 'Suzuki', '三菱': 'Mitsubishi', 
      'ダイハツ': 'Daihatsu', 'ＢＭＷ': 'BMW', 'メルセデス・ベンツ': 'Mercedes-Benz', 
      'アウディ': 'Audi', 'フォルクスワーゲン': 'Volkswagen', 'ポルシェ': 'Porsche', 
      'ボルボ': 'Volvo', 'ジープ': 'Jeep', 'ランドローバー': 'Land Rover', 'アストンマーティン': 'Aston Martin'
  };

  let marcaEncontrada = '';
  // Teste de breadcrumbs 
  const potentialBrands = [];
  $('a[href*="/usedcar/brand-"] > span, a[href*="/usedcar/brand-"]').each((i, el) => {
      let t = $(el).text().trim().replace('の中古車', '');
      if (t) potentialBrands.push(t);
  });
  console.log('Potential Brand nodes:', potentialBrands);

  for (const p of potentialBrands) {
     if (brandMap[p]) { marcaEncontrada = p; break; }
  }

  // Teste no title diretamente
  if (!marcaEncontrada) {
     for (const key of Object.keys(brandMap)) {
         if (title.includes(key)) {
             marcaEncontrada = key;
             break;
         }
     }
  }

  console.log('Found Brand:', marcaEncontrada, '->', brandMap[marcaEncontrada]);

} catch (e) {
  console.error(e);
}
