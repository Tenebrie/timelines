import Koa from 'koa'
import { BaseHttpError } from './BaseHttpError'

export const HttpErrorHandler = async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
	try {
		await next()
	} catch (err) {
		if (err instanceof BaseHttpError) {
			ctx.status = err.status
			ctx.body = {
				status: err.status,
				reason: err.reason,
				message: err.message,
			}
		} else {
			throw err
		}
	}
}
