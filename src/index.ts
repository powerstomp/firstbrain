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
	const user = (socket as any).user as User;
	console.log('New connection:', socket.conn.remoteAddress);
	socket.on('disconnect', () => {
		console.log('Disconnected:', socket.conn.remoteAddress);
	});
	socket.emit('chats', await chatService.getAllChats());
});

eventBus.on('new chat', async (chat) => {
	sio.emit('chat:new', chat);
});
eventBus.on('new message', async (chat) => {
	sio.emit('chat:new', chat);
});

httpServer.listen(CFG.PORT, () => {
	console.log(`App started at port ${CFG.PORT}`)
});
