const fs = require('fs');
const cheerio = require('cheerio');

try {
  const htmlInfo = fs.readFileSync('goonet_dump.html', 'utf-8');
  const $ = cheerio.load(htmlInfo);

  console.log('--- EQUIPMENT ICONS ---');
  // O Goo-net possui a seção de equipamentos geralmente em blocos como <ul class="equipList"> ou <div class="equip_area">
  // Ou às vezes o HTML gerado tem ícones de "on" / "off"
  
  const equipArr = [];
  
  // Muitos sites japoneses usam <li class="on"> para ativo
  $('.equipList li.on, .equip-list li.is-active, .eq_icon_box li').each((i, el) => {
     let txt = $(el).text().trim();
     if(txt) equipArr.push(txt);
  });
  
  // Tentar encontrar qualquer tag li que contenha algo comum
  if(equipArr.length === 0) {
     $('li').each((i, el) => {
        let text = $(el).text().trim();
        // Palavras chaves de equipamentos comuns
        if(text.includes('エアコン') || text.includes('パワステ') || text.includes('パワーウィンドウ') || text.includes('エアバッグ')) {
           // Checar se o elemento pai ou avô diz que este equipamento está 'presente' (ex: não tem classe 'off')
           if(!$(el).hasClass('off') && !$(el).hasClass('inactive')) {
              if(!equipArr.includes(text)) equipArr.push(text.replace(/\s+/g,' '));
           }
        }
     });
  }

  // Tentar capturar a tabela específica de opções (`オプション`)
  $('.optionList li').each((i, el) => {
     let txt = $(el).text().trim();
     if(txt) equipArr.push(txt);
  });

  console.log('Equipments Found:', equipArr);

} catch (e) {
  console.error(e);
}
