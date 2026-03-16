const fs = require('fs');
const cheerio = require('cheerio');

try {
  const htmlInfo = fs.readFileSync('goonet_dump.html', 'utf-8');
  const $ = cheerio.load(htmlInfo);
  
  console.log('--- FINDING MARCA E MODELO ---');
  // Title contains it: トヨタ プリウス Ｓセーフティプラス
  const title = $('title').text();
  console.log('Title:', title);
  
  // Let's look for breadcrumbs under a different class
  let breadcrumbsFound = [];
  $('ul[class*="bread"] li, ul[id*="pankuzu"] li, [class*="pankuzu"] li, a[href*="/usedcar/brand-"]').each((i, el) => {
     let text = $(el).text().trim();
     if(text && !breadcrumbsFound.includes(text)) breadcrumbsFound.push(text);
  });
  console.log('Found possible breadcrumbs:', breadcrumbsFound);

  // Images: the high quality ones usually have /P/ or /L/ instead of /S/ or /J/
  // The gallery list usually contains `galleryList` or `swiper`
  console.log('--- IMAGES CSS SELECTORS ---');
  let imgs = [];
  $('img[src*="picture1.goo-net.com"]').each((i, el) => {
    imgs.push($(el).attr('src'));
  });
  console.log('Picture1 imgs count:', imgs.length);

} catch (e) {
  console.error(e);
}
