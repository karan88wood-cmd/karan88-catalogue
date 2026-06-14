import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { name, material, category, dimensions } = await req.json()

    const prompt = `Write a compelling product description for an export furniture catalogue. 

Product details:
- Name: ${name}
- Material: ${material}
- Category: ${category || 'furniture'}
- Dimensions: ${dimensions || 'not specified'}
- Manufacturer: Karan88 Exports, Panchkuian Furniture Market, New Delhi
- Target buyers: USA, UK, Europe, UAE, Australia

Write 2-3 sentences that highlight the craftsmanship, material quality, and appeal to international buyers. Be specific about the wood's properties. Do not use generic marketing filler. Sound professional and trustworthy. Do not include price or contact info.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const description = data.content?.[0]?.text?.trim()

    if (!description) {
      return NextResponse.json({ error: 'No description generated' }, { status: 500 })
    }

    return NextResponse.json({ description })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
