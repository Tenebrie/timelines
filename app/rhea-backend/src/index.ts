import Koa from 'koa'
import { AuthRouter } from './routers/AuthRouter'
import * as bodyParser from 'koa-bodyparser'
import { BaseHttpError } from './framework/errors/HttpError'
import { SwaggerRouter } from './framework/magic/SwaggerGenerator'

const app = new Koa()

app
	.use(async (ctx, next) => {
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
				console.error('Unknown error', err)
				throw err
			}
		}
	})
	.use(bodyParser())
	.use(AuthRouter.routes())
	.use(AuthRouter.allowedMethods())
	.use(SwaggerRouter.routes())

app.listen(3000)
console.info('[RHEA] Server up')
