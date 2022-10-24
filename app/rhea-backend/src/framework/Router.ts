import * as Koa from 'koa'
import * as KoaRouter from '@koa/router'
import { ExtractedRequestParams } from './TypeUtils'

export class Router<StateT = Koa.DefaultState, ContextT = Koa.DefaultContext> {
	public koaRouter: KoaRouter = new KoaRouter()

	use(...middleware: Array<KoaRouter.Middleware<StateT, ContextT>>): KoaRouter<StateT, ContextT> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return this.koaRouter.use(...middleware)
	}

	get<P extends string>(
		path: P,
		...middleware: Array<KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>>
	): KoaRouter<StateT, ContextT> & ExtractedRequestParams<P> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return this.koaRouter.get(path, ...middleware)
	}

	post<P extends string>(
		path: P,
		...middleware: Array<KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>>
	): KoaRouter<StateT, ContextT & ExtractedRequestParams<P>> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return this.koaRouter.post(path, ...middleware)
	}

	routes() {
		return this.koaRouter.routes()
	}

	allowedMethods() {
		return this.koaRouter.allowedMethods()
	}
}
