const axios = require('axios');

async function translateText(text, from = 'ja', to = 'pt') {
    if (!text) return '';
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await axios.get(url);
        if (res.data && res.data[0]) {
            return res.data[0].map(item => item[0]).join('');
        }
    } catch (err) {
        console.error('Translation failed:', err.message);
    }
    return text; // Return original if fails
}

async function test() {
   const t1 = await translateText('Ｓセーフティプラス');
   console.log('Model JP:', 'Ｓセーフティプラス', '-> PT:', t1);

   const t2 = await translateText('ホワイトパールクリスタルシャイン');
   console.log('Color JP:', 'ホワイトパールクリスタルシャイン', '-> PT:', t2);
   
   const t3 = await translateText('プリウス');
   console.log('Brand/Model JP:', 'プリウス', '-> PT:', t3);
}

test();
