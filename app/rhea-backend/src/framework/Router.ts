import * as Koa from 'koa'
import * as KoaRouter from '@koa/router'
import { ExtractedRequestParams } from './TypeUtils'

export class Router<StateT = Koa.DefaultState, ContextT = Koa.DefaultContext> {
	public koaRouter: KoaRouter = new KoaRouter()

	public use(...middleware: Array<KoaRouter.Middleware<StateT, ContextT>>) {
		return this.koaRouter.use(...middleware)
	}

	public get<P extends string>(
		path: P,
		callback: KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>
	) {
		return this.koaRouter.get(path, callback)
	}

	public post<P extends string>(
		path: P,
		callback: KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>
	) {
		return this.koaRouter.post(path, callback)
	}

	public put<P extends string>(
		path: P,
		callback: KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>
	) {
		return this.koaRouter.put(path, callback)
	}

	public delete<P extends string>(
		path: P,
		callback: KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>
	) {
		return this.koaRouter.delete(path, callback)
	}

	public del<P extends string>(
		path: P,
		callback: KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>
	) {
		return this.koaRouter.del(path, callback)
	}

	public patch<P extends string>(
		path: P,
		callback: KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>
	) {
		return this.koaRouter.patch(path, callback)
	}

	public routes() {
		return this.koaRouter.routes()
	}

	public allowedMethods() {
		return this.koaRouter.allowedMethods()
	}
}
