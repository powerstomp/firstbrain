import { defineConfig } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { User } from './users/User.entity.js';
import { CFG } from './config.js';
import { Chat } from './chats/Chat.entity.js';
import { Message } from './chats/Message.entity.js';

export default defineConfig({
	entities: [User, Chat, Message],
	dbName: CFG.DB_NAME,
	host: CFG.DB_HOST,
	port: CFG.DB_PORT,
	user: CFG.DB_USERNAME,
	password: CFG.DB_PASSWORD,
	metadataProvider: TsMorphMetadataProvider,
	debug: true,
});
