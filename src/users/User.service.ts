import { EntityManager } from "@mikro-orm/core";
import { User } from "./User.entity.js";
import { hashPassword, checkPassword } from "@/utils/password.js"

export class UserService {
	constructor(readonly em: EntityManager) {}

	async getUserById(id: number) {
		return this.em.findOne(User, { id });
	}
	async createUser(username: string, password: string | null) {
		let user = this.em.create(User, {
			username,
			password: !password ? null : await hashPassword(password)
		});
		await this.em.flush();
		return user;
	}
	async authenticateUser(username: string, password: string) {
		let user = await this.em.findOne(User, { username });
		if (!user)
			return null;
		if (!await checkPassword(password, user.password))
			return null;
		return user;
	}
};
