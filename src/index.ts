import express from 'express';
import { CFG } from '@/config.js';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import userRouter from './users/User.http.js';
import { UserService } from './users/User.service.js';

const orm = await MikroORM.init();
await orm.schema.refreshDatabase(); // TODO: Migrations

const app = express();

app.use(express.urlencoded());
app.use(express.json());

let userService = new UserService(orm.em.fork());

passport.use(new JwtStrategy({
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: CFG.JWT_SECRET,
}, async (payload, done) => {
	let user = userService.getUserById(payload.id);
	if (!user)
		return done(null, false);
	return done(null, user)
}));

app.use((req, res, next) => {
	RequestContext.create(orm.em, next);
});

app.use('/users', userRouter(new UserService(orm.em.fork())));

app.listen(CFG.PORT, () => {
	console.log(`App started at port ${CFG.PORT}`)
});
