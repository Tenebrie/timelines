import Koa from 'koa'
import { AuthRouter } from './routers/AuthRouter'
import * as bodyParser from 'koa-bodyparser'
import { BaseHttpError } from './framework/errors/HttpError'
import { SwaggerRouter } from './framework/magic/SwaggerGenerator'
import { useApiInfo } from './framework/useApiInfo'

const app = new Koa()

useApiInfo({
	title: 'Timelines Rhea',
	description: 'This is a description field',
	termsOfService: 'https://example.com',
	contact: {
		name: 'Tenebrie',
		url: 'https://github.com/tenebrie',
		email: 'tianara@tenebrie.com',
	},
	license: {
		name: 'MIT',
		url: 'https://example.com',
	},
	version: '1.0.0',
})

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
