import { EntityManager, wrap } from "@mikro-orm/core";
import { Card } from "./Card.entity.js";
import { Chat } from "./Chat.entity.js";
import EventEmitter from "events";

export class CardService {
	constructor(readonly em: EntityManager,
		private eventBus?: EventEmitter) {}

	async getCardById(id: string) {
		return this.em.findOne(Card, { id });
	}
	async getAllCards() {
		return this.em.findAll(Card, { orderBy: { createdAt: 'desc' } });
	}
	async createCard(chat: Chat, front: string, back?: string) {
		let card = this.em.create(Card, { chat, front, back: (back ?? "") });
		await this.em.flush();
		this.eventBus?.emit('new card', card, chat);
		return card;
	}
	async updateCard(card: Card, dto: Partial<Card>) {
		wrap(card).assign(dto);
		await this.em.flush();
		this.eventBus?.emit('update card', card);
		return card;
	}
};
