/**
 * AI Schedule API Route
 *
 * Currently uses the built-in smart scheduler (no API key needed).
 *
 * To enable real Claude AI scheduling:
 * 1. npm install @anthropic-ai/sdk
 * 2. Set ANTHROPIC_API_KEY in Vercel environment variables
 * 3. Uncomment the Anthropic block below
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildSchedulePrompt, generateScheduleMock } from '@/lib/ai-scheduler'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { assignments, events, freeTimeBlocks, settings, startDate, days } = body

  // ── Uncomment to enable real Claude AI (requires @anthropic-ai/sdk installed) ──
  // if (process.env.ANTHROPIC_API_KEY) {
  //   try {
  //     const { default: Anthropic } = await import('@anthropic-ai/sdk' as any)
  //     const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  //     const prompt = buildSchedulePrompt({ assignments, events, settings, startDate, days })
  //     const message = await client.messages.create({
  //       model: 'claude-opus-4-7',
  //       max_tokens: 4096,
  //       messages: [{ role: 'user', content: prompt }],
  //     })
  //     const content = message.content[0]
  //     if (content.type === 'text') {
  //       const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  //       if (jsonMatch) {
  //         const result = JSON.parse(jsonMatch[0])
  //         return NextResponse.json(result)
  //       }
  //     }
  //   } catch (err) {
  //     console.error('AI scheduling error, falling back to mock:', err)
  //   }
  // }

  const result = generateScheduleMock({ assignments, events, freeTimeBlocks, settings, startDate, days })
  return NextResponse.json(result)
}
