import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property, UuidType } from "@mikro-orm/core";
import { v7 as uuid } from 'uuid';
import { Chat } from "./Chat.entity.js";

@Entity()
export class Card {
	[OptionalProps]?: 'createdAt' | 'updatedAt'

	@PrimaryKey({ type: UuidType })
	id = uuid();

	@Property()
	front!: string;

	@Property()
	back = "";

	@ManyToOne()
	chat!: Chat;

	@Property()
	createdAt = new Date();

	@Property({ onUpdate: () => new Date() })
	updatedAt = new Date();
};
