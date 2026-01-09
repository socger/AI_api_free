import "dotenv/config";
import { Groq } from "groq-sdk";
import { AIService, ChatMessage } from "../types";

const groq = new Groq();

export const groqService: AIService = {
  name: "Groq",
  async chat(messages: ChatMessage[]) {
    console.log("Iniciando llamada a Groq...");
    const chatCompletion = await groq.chat.completions
      .create({
        messages,
        // model: "llama-3.3-70b-versatile",
        model: "moonshotai/kimi-k2-instruct-0905",
        temperature: 0.6,
        max_completion_tokens: 4096,
        top_p: 1,
        stream: true,
        stop: null,
      })
      .catch((err) => {
        console.error("Error en Groq:", err.message);
        throw err;
      });

    console.log("Respuesta de Groq recibida, streaming...");

    return (async function* () {
      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          yield content;
        }
      }
      console.log("\nStreaming finalizado.");
    })();
  },
};
