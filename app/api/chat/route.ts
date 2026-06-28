import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { PERSONAS, type PersonaId } from "@/lib/personas"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export async function POST(req: Request) {
  const {
    messages,
    persona = "academic",
  }: { messages: UIMessage[]; persona?: PersonaId } = await req.json()

  const selectedPersona = PERSONAS[persona] ?? PERSONAS.academic

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: selectedPersona.systemPrompt,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
