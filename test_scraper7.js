const fs = require('fs');
const cheerio = require('cheerio');

try {
  const htmlInfo = fs.readFileSync('goonet_dump.html', 'utf-8');
  const $ = cheerio.load(htmlInfo);

  // O HTML do Goo-net possui uma tabela de "Estado" e de "Equipamentos Opcionais" (opcionais: 装備オプション)
  console.log('--- ALL TH ELEMENTS ---');
  $('th').each((i, el) => {
     let txt = $(el).text().trim();
     if(txt && txt.length < 20) { // ignorar textos longos pra não poluir
        // Pegar o valor do TD logo em seguida
        let val = $(el).next('td').text().trim() || $(el).parent().find('td').text().trim();
        if(val && val.length > 0 && val.length < 50) {
           console.log(txt, ':', val.replace(/\s+/g, ' '));
        }
     }
  });

} catch (e) {
  console.error(e);
}
