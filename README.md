Para ejecutar el servidor en modo dev
    npm run dev 

Para comprobar el endPoint de chat:
    curl -X POST http://localhost:3005/chat   -H "Content-Type: application/json"   -N   -d '{"messages": [{"role": "user", "content": "Hola, contestame en español. Resuelve Fibonacci en JavaScript."}]}'

El puerto está declarado en .env, variable PORT.
Las API key para las IA también están declaradas en .env
