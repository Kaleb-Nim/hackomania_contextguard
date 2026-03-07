import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { chatId, message } = await req.json();

    if (!chatId || !message) {
      return NextResponse.json({ error: 'Chat ID and message are required' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN is not set in environment variables.");
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is missing. Please add it to your .env.local file and restart the server.' }, { status: 400 });
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.description || 'Failed to send message' }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Telegram API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
