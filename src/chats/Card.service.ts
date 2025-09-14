import { EntityManager } from "@mikro-orm/core";
import { Card } from "./Card.entity.js";

export class CardService {
	constructor(readonly em: EntityManager) {}

	async getCardById(id: string) {
		return this.em.findOne(Card, { id });
	}
	async getAllCards() {
		return this.em.findAll(Card, { orderBy: { createdAt: 'desc' } });
	}
	async createCard(front: string, back?: string) {
		let card = this.em.create(Card, { front, back: (back ?? "") });
		await this.em.flush();
		return card;
	}
};
