const fs = require('fs');
const cheerio = require('cheerio');

try {
  const htmlInfo = fs.readFileSync('goonet_dump.html', 'utf-8');
  const $ = cheerio.load(htmlInfo);
  
  console.log('--- MARCA & MODELO ---');
  let m1 = [], m2 = [];
  $('#pankuzu_area li, .breadcrumbs li, .breadcrumbList li').each((i, el) => {
    m1.push($(el).text().trim());
  });
  $('.pankuzu_area li').each((i, el) => {
    m2.push($(el).text().trim());
  });
  console.log('Breadcrumbs selectors 1:', m1);
  console.log('Breadcrumbs selectors 2:', m2);

  console.log('--- COLOR ---');
  console.log('1:', $('th:contains("色") + td').first().text().trim());
  console.log('2:', $('.spec_table th:contains("車体色") + td').first().text().trim());
  console.log('3:', $('dt:contains("色") + dd').first().text().trim());

  console.log('--- IMAGES ---');
  const imagens = [];
  $('img').each((i, el) => {
    let src = $(el).attr('data-src') || $(el).attr('src');
    if (src && src.includes('.jpg') && !src.includes('blank')) {
      if (!imagens.includes(src)) imagens.push(src);
    }
  });
  console.log('Found', imagens.length, 'JPG images total. Top 5:');
  console.log(imagens.slice(0, 5));

} catch (e) {
  console.error(e);
}
