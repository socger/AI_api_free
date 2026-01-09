import "dotenv/config";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { AIService, ChatMessage } from "../types";

const cerebras = new Cerebras();

export const cerebrasService: AIService = {
  name: "Cerebras",
  async chat(messages: ChatMessage[]) {
    console.log("Iniciando llamada a Cerebras...");
    const chatCompletion = await cerebras.chat.completions
      .create({
        messages: messages as any,
        model: "gpt-oss-120b",
        stream: true,
        max_completion_tokens: 32768,
        temperature: 1,
        top_p: 1,
        reasoning_effort: "medium",
      })
      .catch((err) => {
        console.error("Error en Cerebras:", err.message);
        throw err;
      });

    console.log("Respuesta de Groq recibida, streaming...");

    return (async function* () {
      for await (const chunk of chatCompletion) {
        const content = (chunk as any).choices[0]?.delta?.content || "";
        if (content) {
          yield content;
        }
      }
      console.log("\nStreaming finalizado.");
    })();
  },
};
