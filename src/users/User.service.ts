import { EntityManager } from "@mikro-orm/core";
import { User } from "./User.entity.js";
import { checkPassword } from "@/utils/password.js"

export class UserService {
	constructor(readonly em: EntityManager) {}

	async getUserById(id: number) {
		return this.em.findOne(User, { id });
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
