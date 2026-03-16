const fs = require('fs');
const cheerio = require('cheerio');

try {
  const htmlInfo = fs.readFileSync('goonet_dump.html', 'utf-8');
  const $ = cheerio.load(htmlInfo);

  console.log('--- EQUIPMENT SPEC TABLES ---');
  // Em japones, equipamentos de carrocerias e interior costumam ficar em tabelas específicas
  // Procure palavras chaves comuns ou tabelas com th e td contendo checkmarks ou bolas '○' ou '◯' ou '装備' (Equipment)
  
  const equipmentKeys = [];
  
  // Tentar encontrar qualquer tag contendo texto "装備" (Equipment/Features)
  $('th:contains("装備"), h3:contains("装備"), .equip_area, .equipList').each((i, el) => {
     console.log('Found Equip Node:', $(el).prop('tagName'), $(el).attr('class') || '', $(el).text().trim().substring(0, 50));
  });

  // Procurar por listas ul/li que tem icone ou texto de equipamento
  $('.equipList li, .spec_equip li, .equipment-list li, tr:contains("装備") td').each((i, el) => {
     const t = $(el).text().trim();
     if(t) equipmentKeys.push(t);
  });

  console.log('Potential Equipments (List):', equipmentKeys.slice(0, 20));

  // Tentar na box de detalhes estruturada (JSON-LD nao tem equip)
  console.log('\n--- DOM TRAVERSAL ---');
  // Olhar td que tem bola '○'
  $('td:contains("○"), td:contains("◯")').each((i, el) => {
     const th = $(el).prev('th').text().trim() || $(el).closest('tr').find('th').text().trim();
     if(th) console.log(th + ': Yes');
  });

  // Olhar spans ou div com texto de equipamento
  const allEquip = [];
  $('.eq_icon_box .eq_icon, .equip-item, .info-equip li').each((i, el) => {
      allEquip.push($(el).text().trim());
  });
  console.log('Icon box or classes:', allEquip);

} catch (e) {
  console.error(e);
}
