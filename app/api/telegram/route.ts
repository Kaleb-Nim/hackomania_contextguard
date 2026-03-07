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

    // Attempt to get the number of users in the chat first
    let memberCount = null;
    try {
      const countRes = await fetch(`https://api.telegram.org/bot${botToken}/getChatMemberCount?chat_id=${chatId}`);
      if (countRes.ok) {
        const countData = await countRes.json();
        if (countData.ok) {
           let totalCount = countData.result;
           
           // In Telegram Channels, all bots must be administrators, so we can count them
           let botCount = 0;
           const adminRes = await fetch(`https://api.telegram.org/bot${botToken}/getChatAdministrators?chat_id=${chatId}`);
           if (adminRes.ok) {
             const adminData = await adminRes.json();
             if (adminData.ok) {
               botCount = adminData.result.filter((admin: any) => admin.user.is_bot).length;
             }
           }
           
           memberCount = totalCount - botCount;
        }
      }
    } catch (e) {
      console.error("Failed to fetch member count", e);
    }
    
    // If the message is a special internal flag just to fetch the count, return early
    if (message === "count_only") {
      return NextResponse.json({ success: true, memberCount });
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

    return NextResponse.json({ success: true, data, memberCount });
  } catch (error) {
    console.error('Telegram API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
