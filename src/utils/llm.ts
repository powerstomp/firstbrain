import { CFG } from '@/config.js';
import OpenAI from 'openai';

const client = new OpenAI({
	baseURL: CFG.LLM_BASE_URL,
	apiKey: CFG.LLM_API_KEY
});

export async function ask(input: string) {
	return client.chat.completions.create({
		model: CFG.LLM_MODEL,
		messages: [
			{ role: "system", content: "You are a helpful assistant." },
			{ role: "user", content: input },
		]
	});
}
