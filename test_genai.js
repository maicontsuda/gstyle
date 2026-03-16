const {GoogleGenAI} = require('@google/genai');
const ai = new GoogleGenAI({apiKey:'test'});
console.log('ai keys:', Object.keys(ai));
// Check models and generateContent
if (ai.models) {
  console.log('ai.models keys:', Object.keys(ai.models));
} else {
  console.log('No ai.models');
}
