import { EntityManager } from "@mikro-orm/core";
import { Chat } from "./Chat.entity.js";
import { User } from "@/users/User.entity.js";
import { Message } from "./Message.entity.js";

export class ChatService {
	constructor(readonly em: EntityManager) {}

	async getChatById(id: string) {
		return this.em.findOne(Chat, { id });
	}
	async getAllChats() {
		return this.em.findAll(Chat, { orderBy: { createdAt: 'asc' } });
	}
	async createChatByMessage(author: User, text: string) {
		let chat = this.em.create(Chat, {});
		let message = this.em.create(Message, { chat, author, text });
		await this.em.flush();
		return chat;
	}
	async addMessage(chatId: string, author: User, text: string) {
		let chat = await this.getChatById(chatId);
		if (!chat)
			throw new Error("Chat not found.");
		let message = this.em.create(Message, { chat, author, text });
		await this.em.flush();
		return message;
	}
};
