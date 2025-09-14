import { Entity, OptionalProps, PrimaryKey, Property, UuidType } from "@mikro-orm/core";
import { v7 as uuid } from 'uuid';

@Entity()
export class Card {
	[OptionalProps]?: 'createdAt' | 'updatedAt'

	@PrimaryKey({ type: UuidType })
	id = uuid();

	@Property()
	front!: string;

	@Property()
	back = "";

	@Property()
	createdAt = new Date();

	@Property({ onUpdate: () => new Date() })
	updatedAt = new Date();
};
