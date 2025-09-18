import { Card } from '@/chats/Card.entity.js';
import { CFG } from '@/config.js';
import { z } from 'zod';
import PROMPT from '@/utils/llm.prompt.js'
import { GoogleGenAI } from "@google/genai";
import { Chat } from '@/chats/Chat.entity.js';

const client = new GoogleGenAI({
	apiKey: CFG.LLM_API_KEY
});

const CardFormat = z.object({
	front: z.string(),
	back: z.string().optional(),
});

const ResponseFormat = z.object({
	response: z.string(),
	cards: z.array(CardFormat),
});

export async function ask(chat: Chat) {
	let response = await client.models.generateContent({
		model: CFG.LLM_MODEL,
		contents: chat.messages.map((msg) => ({
			role: (msg.author.username === 'LLM' ? 'model' : 'user'),
			parts: [{ text: msg.text }]
		})),
		config: {
			systemInstruction: PROMPT,
			responseMimeType: 'application/json',
			responseJsonSchema: z.toJSONSchema(ResponseFormat),
		}
	});
	if (!response.text)
		throw new Error('Response is empty.');
	let resp = ResponseFormat.parse(JSON.parse(response.text));
	return resp;
}
