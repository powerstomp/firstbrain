import { Entity, PrimaryKey, Property, ManyToOne, OptionalProps } from "@mikro-orm/core";
import { v7 as uuid } from 'uuid';
import { Chat } from "./Chat.entity.js";
import { User } from "@/users/User.entity.js";

@Entity()
export class Message {
	[OptionalProps]?: 'createdAt'

	@PrimaryKey()
	id = uuid();

	@ManyToOne()
	chat!: Chat;

	@ManyToOne()
	author!: User;

	@Property()
	text!: string;

	@Property()
	createdAt = new Date();
};
