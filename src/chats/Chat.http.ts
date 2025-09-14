import { withValidation, requireAuth } from "@/utils/http.js";
import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import { z } from "zod";
import { ChatService } from "./Chat.service.js";

export default function (chatService: ChatService) {
	const router = Router();

	router.put('/', withValidation(z.object({
		text: z.string().nonempty(),
	}), requireAuth(async (req, res) => {
		let chat = await chatService.createChatByMessage(req.user, req.body.text);
		res.json(chat);
	})));
	router.post('/', withValidation(z.object({
		chatId: z.uuid().nonempty(),
		text: z.string().nonempty(),
	}), requireAuth(async (req, res) => {
		let message = await chatService.addMessage(req.body.chatId, req.user, req.body.text);
		res.json(message);
	})));
	router.get('/:chatId', requireAuth(async (req, res) => {
		res.json(await chatService.getChatById(req.params.chatId));
	}));
	router.get('/', requireAuth(async (req, res) => {
		res.json(await chatService.getAllChats());
	}));

	return router;
}
