import { withValidation } from "@/utils/http.js";
import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import { z } from "zod";
import { UserService } from "./User.service.js";
import jwt from "jsonwebtoken";
import { CFG } from "@/config.js";

export default function (userService: UserService) {
	const router = Router();

	router.post('/authenticate', withValidation(z.object({
		username: z.string().nonempty(),
		password: z.string().nonempty(),
	}), async (req, res) => {
		let user = await userService.authenticateUser(req.body.username, req.body.password)
		if (!user)
			return res.status(401).send("");
		res.json({ token: jwt.sign({ id: user.id }, CFG.JWT_SECRET) });
	}));

	return router;
}
