const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const authMiddleware = require('../middleware/auth');

// POST /api/ai-scraper/image
// Body (JSON): { imageBase64: "data:image/jpeg;base64,...", mimeType: "image/jpeg" }
router.post('/image', authMiddleware, async (req, res) => {
  try {
    const allowed = ['admin', 'dono', 'gerente', 'funcionario'];
    if (!req.user || !allowed.includes(req.user.tipo_usuario)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor.' });
    }

    // Strip data URL prefix if present (e.g. "data:image/jpeg;base64,...")
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const imageMime = mimeType || 'image/jpeg';

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `Você é um especialista em anúncios de carros japoneses (Goo-net, CarsensorNet, etc.).
Analise esta imagem de um anúncio de carro japonês e extraia TODAS as informações técnicas visíveis.
Retorne SOMENTE um JSON válido (sem markdown, sem texto antes ou depois), com os campos abaixo.
Se um campo não for encontrado na imagem, use null.
Todos os textos devem ser traduzidos para o Português Brasileiro.

{
  "marca": "ex: Toyota",
  "modelo": "ex: Prius S Safety Plus",
  "ano": 2017,
  "valor": 1580000,
  "kilometragem": 45000,
  "cor": "ex: Branco Pérola Cristal",
  "combustivel": "Híbrido | Gasolina | Diesel | Elétrico",
  "cambio": "CVT | Automático | Manual",
  "portas": 5,
  "lotacao": 5,
  "cilindradas": 1800,
  "tracao": "2WD | 4WD | FF | FR | MR | RR",
  "potencia": "ex: 98ps (72kW)/5200rpm",
  "shakenVencimento": "YYYY-MM",
  "historicoReparo": false,
  "donoUnico": false,
  "equipamentos": ["Ar Condicionado", "Câmera de Ré", "Navegação GPS"],
  "observacoes": "Texto livre com outras informações relevantes do anúncio"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: imageMime,
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    let text = response.text?.trim() || '';

    // Limpar possível markdown ```json ... ``` ao redor do JSON
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error('Gemini retornou texto inválido:', text.substring(0, 200));
      return res.status(422).json({ error: 'A IA não conseguiu interpretar a imagem. Tente um print mais nítido e com a tabela de dados completa visível.', raw: text.substring(0, 500) });
    }

    return res.json(parsed);
  } catch (err) {
    console.error('Erro no ai-scraper:', err);
    return res.status(500).json({ error: 'Erro ao processar imagem com IA.', detail: String(err.message || err) });
  }
});

module.exports = router;
