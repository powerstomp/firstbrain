import { Collection, Entity, OneToMany, OptionalProps, PrimaryKey, Property, UuidType } from "@mikro-orm/core";
import { v7 as uuid } from 'uuid';
import { Message } from "./Message.entity.js";

@Entity()
export class Chat {
	[OptionalProps]?: 'createdAt' | 'updatedAt'

	@PrimaryKey({ type: UuidType })
	id = uuid();

	@Property()
	name?: string;

	@OneToMany({ mappedBy: 'chat' })
	messages = new Collection<Message>(this);

	@Property()
	createdAt = new Date();

	@Property({ onUpdate: () => new Date() })
	updatedAt = new Date();
};
