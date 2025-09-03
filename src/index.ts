import express from 'express';
import { CFG } from '@/config.js';
import bodyParser from 'body-parser';
import { MikroORM } from '@mikro-orm/core';

const orm = await MikroORM.init();
await orm.schema.refreshDatabase(); // TODO: Migrations

const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.listen(CFG.PORT, () => {
	console.log(`App started at port ${CFG.PORT}`)
});
