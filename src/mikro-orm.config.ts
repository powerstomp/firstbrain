import { defineConfig } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { User } from './users/User.entity.js';
import { CFG } from './config.js';

export default defineConfig({
	entities: [User],
	dbName: CFG.DB_NAME,
	host: CFG.DB_HOST,
	port: CFG.DB_PORT,
	user: CFG.DB_USERNAME,
	password: CFG.DB_PASSWORD,
	metadataProvider: TsMorphMetadataProvider,
	debug: true,
});
