import { EntityManager } from "@mikro-orm/core";
import { Chat } from "./Chat.entity.js";
import { User } from "@/users/User.entity.js";
import { Message } from "./Message.entity.js";
import { EventEmitter } from "events";

export class ChatService {
	constructor(readonly em: EntityManager,
		private eventBus?: EventEmitter) {}

	async getChat(chatOrId: string | Chat) {
		return typeof chatOrId === 'string' ? await this.getChatById(chatOrId) : chatOrId;
	}
	async getChatById(id: string) {
		return this.em.findOne(Chat, { id });
	}
	async getAllChats() {
		return this.em.findAll(Chat, { orderBy: { createdAt: 'desc' } });
	}
	async createChatByMessage(author: User, text: string) {
		let chat = this.em.create(Chat, {});
		let message = this.em.create(Message, { chat, author, text });

		await this.em.flush();
		this.eventBus?.emit('new chat', chat, message);
		return chat;
	}
	async addMessage(chatOrId: string | Chat, author: User, text: string) {
		let chat = await this.getChat(chatOrId);
		if (!chat)
			throw Error("Chat not found.");
		let message = this.em.create(Message, { chat, author, text });

		await this.em.flush();
		this.eventBus?.emit('new message', message, chat);
		return message;
	}
	async deleteChat(chatOrId: string | Chat) {
		return await this.em.removeAndFlush(this.getChat(chatOrId));
	}
	async renameChat(chatOrId: string | Chat, name?: string) {
		let chat = await this.getChat(chatOrId);
		if (!chat)
			throw Error("Chat not found.");
		chat.name = name;
		return await this.em.flush();
	}
	async getCards(chatOrId: string | Chat) {
		let chat = await this.getChat(chatOrId);
		if (!chat)
			throw Error("Chat not found.");
		return chat.cards;
	}
};
