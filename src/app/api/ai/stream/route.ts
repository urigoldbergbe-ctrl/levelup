import { NextResponse } from 'next/server'
import { getAnthropicClient, AI_MODEL } from '@/lib/ai/client'
import { getUser } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt } = await request.json() as { prompt: string }
  if (!prompt) return NextResponse.json({ error: 'prompt is required' }, { status: 400 })

  const client = getAnthropicClient()

  const stream = client.messages.stream({
    model: AI_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          controller.enqueue(new TextEncoder().encode(event.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  })
}
