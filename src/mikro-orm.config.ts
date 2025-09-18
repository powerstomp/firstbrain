import { defineConfig, Platform, TextType, Type } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { User } from './users/User.entity.js';
import { CFG } from './config.js';
import { Chat } from './chats/Chat.entity.js';
import { Message } from './chats/Message.entity.js';
import { Card } from './chats/Card.entity.js';

export default defineConfig({
	entities: [User, Chat, Message, Card],
	dbName: CFG.DB_NAME,
	host: CFG.DB_HOST,
	port: CFG.DB_PORT,
	user: CFG.DB_USERNAME,
	password: CFG.DB_PASSWORD,
	metadataProvider: TsMorphMetadataProvider,
	debug: true,
	discovery: {
		getMappedType(type: string, platform: Platform) {
			if (type === 'string') // varchar(255) -> text
				return Type.getType(TextType);
			return platform.getDefaultMappedType(type);
		},
	},
});
