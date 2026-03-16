const fs = require('fs');
const cheerio = require('cheerio');

try {
  const htmlInfo = fs.readFileSync('goonet_dump.html', 'utf-8');
  const $ = cheerio.load(htmlInfo);
  
  console.log('--- IMAGES CSS SELECTORS ---');
  let imgs = [];
  $('img[src*="picture1.goo-net.com"]').each((i, el) => {
    imgs.push($(el).attr('src') || $(el).attr('data-src'));
  });
  
  // Imprimir caminhos de imagens únicos para observação
  const uniqueImgs = [...new Set(imgs)];
  console.log('Unique picture1 imgs count:', uniqueImgs.length);
  console.log('Sample images:');
  uniqueImgs.slice(0, 15).forEach(img => console.log(img));

  // Tentar encontrar blocos de script com arrays de URLs de alta qualidade
  console.log('--- SCRIPT DATA ---');
  $('script').each((i, el) => {
    let scriptContent = $(el).html();
    if (scriptContent && scriptContent.includes('picture1.goo-net.com')) {
      // Procurar por 'P' instead of 'J' or 'S'
      if (scriptContent.includes('/P/')) {
         console.log('Found /P/ images in script', i);
         // Extrair 2 urls para exemplo
         const matches = scriptContent.match(/https?:\/\/picture1.goo-net.com[^"'\s]+/g) || [];
         if (matches.length > 0) {
            console.log(matches.slice(0, 3));
         }
      }
    }
  });

} catch (e) {
  console.error(e);
}
