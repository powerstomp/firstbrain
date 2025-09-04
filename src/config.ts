import z from 'zod';
import dotenv from 'dotenv';

const Config = z.object({
	PORT: z.coerce.number().int().positive(),
	DB_NAME: z.string().nonempty(),
	DB_HOST: z.url().or(z.string("localhost")).nonoptional(),
	DB_PORT: z.coerce.number().int().positive(),
	DB_USERNAME: z.string().nonempty(),
	DB_PASSWORD: z.coerce.string().nonempty(),
	JWT_SECRET: z.string().nonempty(),
});

dotenv.config();
const CFG = Config.parse(process.env);

export { CFG };
