import 'dotenv/config';
import express, { Request, Response } from 'express';

import type  { AIService, ChatMessage } from './types';
import { groqService } from './services/groq';
import { cerebrasService } from './services/cerebras';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const services: AIService[] = [
  groqService,
  cerebrasService,
  // jerofa ahora puedes añadir otros servicios aquí:
  // openaiService,
  // anthropicService,
  // Google Gemini
  // OpenRouter
  // Otro servicio incluso local
];

let currentServiceIndex = 0;

function getNextService(): AIService {
  const service = services[currentServiceIndex];
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service;
}

// Middleware para parsear JSON
app.use(express.json());

/*  Ruta de chat con streaming
    Ejemplo de uso:
      curl -X POST http://localhost:3005/chat   -H "Content-Type: application/json"   -N   -d '{"messages": [{"role": "user", "content": "Hola, contestame en español. Resuelve Fibonacci en JavaScript."}]}'
*/

app.post('/chat', async (req: Request, res: Response): Promise<void> => {
  console.log('[DEBUG] Petición recibida en /chat');
  try {
    const { messages } = req.body as { messages: ChatMessage[] };
    console.log('[DEBUG] Messages:', JSON.stringify(messages));
    
    if (!messages || !Array.isArray(messages)) {
      console.log('[DEBUG] Error: mensajes inválidos');
      res.status(400).json({ error: 'Se requiere un array de mensajes' });
      return;
    }
    
    const service = getNextService();

    // Configurar headers para Server-Sent Events
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    console.log(`[DEBUG] Llamando a service.chat() usando el servicio de ${service?.name}`);
    const stream = await service.chat(messages);
    console.log('[DEBUG] Stream obtenido, comenzando iteración...');
    
    // Iterar sobre el stream AsyncIterable
    for await (const chunk of stream) {
      if (chunk) {
        res.write(chunk);
      }
    }
    
    console.log('[DEBUG] Stream completado');
    res.end();
  } catch (error: any) {
    console.error('[ERROR] Error en /chat:', error);
    console.error('[ERROR] Stack:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al procesar el chat', details: error.message });
    } else {
      res.end();
    }
  }
});

// Ruta principal
app.get('/', (_req: Request, res: Response) => {
  res.send('El API está funcionando correctamente.');
});

// Ejemplo de función con tipos
function saludar(nombre: string): string {
  return `Hola, ${nombre}!`;
}

// Ejemplo de otra ruta
app.get('/saludo/:nombre', (req: Request, res: Response) => {
  const mensaje: string = saludar(req.params.nombre);
  res.json({ mensaje });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`¡Servidor corriendo en http://localhost:${PORT}!`);
});
