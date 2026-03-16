const fs = require('fs');
const cheerio = require('cheerio');

try {
  const htmlInfo = fs.readFileSync('goonet_dump.html', 'utf-8');
  const $ = cheerio.load(htmlInfo);
  
  console.log('--- PRICE ---');
  // Encontrar o texto de preço
  const priceSelectors = [
    '.price_info .num', 
    '.veh-price_txt .price', 
    'th:contains("支払総額") + td',
    'dt:contains("支払総額") + dd',
    '.price'
  ];
  
  priceSelectors.forEach(sel => {
    console.log(sel, '->', $(sel).first().text().trim());
  });

  console.log('--- YEAR ---');
  console.log('1:', $('th:contains("年式") + td').first().text().trim());
  console.log('2:', $('.spec_info dl:contains("年式") dd').first().text().trim());
  console.log('3:', $('.spec-data dt:contains("年式") + dd').first().text().trim());

  console.log('--- KM ---');
  console.log('1:', $('th:contains("走行距離") + td').first().text().trim());
  console.log('2:', $('.spec-data dt:contains("走行") + dd').first().text().trim());

} catch (e) {
  console.error(e);
}
