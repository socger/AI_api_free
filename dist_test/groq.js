"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const groq_sdk_1 = require("groq-sdk");
const groq = new groq_sdk_1.Groq();
console.log('Iniciando llamada a Groq...');
const chatCompletion = await groq.chat.completions.create({
    "messages": [
        {
            "role": "user",
            "content": "Hola, responde brevemente"
        }
    ],
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.6,
    "max_completion_tokens": 100,
    "stream": false
}).catch(err => {
    console.error('Error:', err.message);
    throw err;
});
console.log('\nRespuesta de Groq:\n');
console.log(chatCompletion.choices[0]?.message?.content);
console.log('\n\nFinalizado.');
