import { json } from '@sveltejs/kit';
import { chat, type ChatMessage } from '$lib/server/chat';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { messages } = await request.json() as { messages: ChatMessage[] };

	if (!messages?.length) {
		return json({ error: 'No messages provided' }, { status: 400 });
	}

	try {
		const result = await chat(messages);
		return json(result);
	} catch (err) {
		console.error('Chat error:', err);
		return json({ error: String(err) }, { status: 500 });
	}
};
