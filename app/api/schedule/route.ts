/**
 * AI Schedule API Route
 *
 * In production, set ANTHROPIC_API_KEY in your environment and
 * install @anthropic-ai/sdk. This route accepts the same parameters
 * as the mock scheduler and returns a structured schedule JSON.
 *
 * POST /api/schedule
 * Body: { assignments, events, settings, startDate, days }
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildSchedulePrompt, generateScheduleMock } from '@/lib/ai-scheduler'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { assignments, events, freeTimeBlocks, settings, startDate, days } = body

  // If API key is available, use real AI
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      // Dynamically import to avoid errors when SDK not installed
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

      const prompt = buildSchedulePrompt({ assignments, events, settings, startDate, days })

      const message = await client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = message.content[0]
      if (content.type !== 'text') throw new Error('Unexpected response type')

      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')

      const result = JSON.parse(jsonMatch[0])

      // Convert AI response to our DaySchedule format
      const schedules = result.schedule.map((day: { date: string; blocks: { id?: string; title: string; startTime: string; endTime: string; type: string; category: string; assignmentId?: string; priority?: string }[] }) => ({
        date: day.date,
        scheduledBlocks: day.blocks.map((block: { id?: string; title: string; startTime: string; endTime: string; type: string; category: string; assignmentId?: string; priority?: string }) => ({
          id: block.id ?? crypto.randomUUID(),
          title: block.title,
          startTime: block.startTime,
          endTime: block.endTime,
          type: block.type,
          category: block.category,
          assignmentId: block.assignmentId,
          priority: block.priority,
        })),
      }))

      return NextResponse.json({ schedules, insights: result.insights })
    } catch (error) {
      console.error('AI scheduling error, falling back to mock:', error)
    }
  }

  // Fallback: client-side mock (or server-side mock when no API key)
  const result = generateScheduleMock({ assignments, events, freeTimeBlocks, settings, startDate, days })
  return NextResponse.json(result)
}
