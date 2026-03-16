require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function testRealImage() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    console.log('Fetching sample car image...');
    const imgRes = await fetch('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?fm=jpg&w=400&q=60');
    const arrayBuffer = await imgRes.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    
    console.log('Calling Gemini...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Analyze this image and return a JSON object with {"is_car": true/false}' },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data,
              },
            },
          ],
        },
      ],
    });
    
    console.log('Response:', response.text);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
testRealImage();
