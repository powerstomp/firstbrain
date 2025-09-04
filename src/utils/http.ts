import { Request, Response, NextFunction, RequestHandler } from "express";
import { z } from "zod";

function withValidation<T extends z.ZodTypeAny>(
	schema: T,
	handler: (
		req: Omit<Request, "body"> & { body: z.infer<T> },
		res: Response,
		next: NextFunction
	) => any
): RequestHandler {
	return (req, res, next) => {
		const parsed = schema.safeParse(req.body);
		if (!parsed.success)
			return res.status(400).json(z.flattenError(parsed.error));
		req.body = parsed.data;
		return handler(req, res, next);
	};
}

export { withValidation }
