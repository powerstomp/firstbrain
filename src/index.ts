import express from 'express';
import { CFG } from '@/config.js';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import userRouter from './users/User.http.js';
import chatRouter from './chats/Chat.http.js';
import { UserService } from './users/User.service.js';
import { ChatService } from './chats/Chat.service.js';
import EventEmitter from 'events';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from './users/User.entity.js';
import { createServer } from 'http';
import { Chat } from './chats/Chat.entity.js';
import { Message } from './chats/Message.entity.js';
import * as llm from './utils/llm.js';

const orm = await MikroORM.init();
await orm.schema.refreshDatabase(); // TODO: Migrations

const app = express();
const httpServer = createServer(app);
const sio = new SocketServer(httpServer);

app.use(express.urlencoded());
app.use(express.json());

let eventBus = new EventEmitter();
let userService = new UserService(orm.em.fork());
let chatService = new ChatService(orm.em.fork(), eventBus);

let user = await userService.createUser('admin', '123456');
let llmUser = await userService.createUser("LLM", null);
let chat = await chatService.createChatByMessage(user, 'Demo chat.');

passport.use(new JwtStrategy({
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: CFG.JWT_SECRET,
}, async (payload, done) => {
	let user = await userService.getUserById(payload.id);
	if (!user)
		return done(null, false);
	return done(null, user)
}));

app.use((req, res, next) => {
	RequestContext.create(orm.em, next);
});

app.use((req, res, next) => {
	passport.authenticate("jwt", { session: false },
		(err: any, user: Express.User | undefined | null) => {
			if (!err && user)
				req.user = user;
			next();
		}
	)(req, res, next);
});

app.use('/users', userRouter(userService));
app.use('/chats', chatRouter(chatService));

sio.use(async (socket, next) => {
	const token = socket.handshake.auth?.token;

	if (!token)
		return next(new Error("Unauthorized"));

	try {
		const payload = jwt.verify(token, CFG.JWT_SECRET) as { id: number };
		let user = await userService.getUserById(payload.id);
		if (!user)
			next(new Error("User not found"));
		(socket as any).user = user;
		next();
	} catch (err) {
		next(new Error("Unauthorized"));
	}
});

sio.use((socket, next) => {
	RequestContext.create(orm.em, next);
});

sio.on('connection', async (socket) => {
	socket.on('chat:join', (chatId) => {
		socket.join(chatId);
	});
	socket.on('chat:leave', (chatId) => {
		socket.leave(chatId);
	});
});

eventBus.on('new chat', async (chat, message) => {
	sio.emit('chat:new', chat);
});
eventBus.on('new message', async (message: Message, chat: Chat) => {
	sio.to(chat.id).emit('message:new', message);

	if (message.text.includes('@llm'))
		llm.ask(message.text).then((response) => {
			if (response.choices[0].message.content)
				chatService.addMessage(chat, llmUser, response.choices[0].message.content);
		}).catch(console.error);
});

httpServer.listen(CFG.PORT, () => {
	console.log(`App started at port ${CFG.PORT}`)
});
