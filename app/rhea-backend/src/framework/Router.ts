/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as Koa from 'koa'
import * as KoaRouter from '@koa/router'
import { ExtractedRequestParams } from './TypeUtils'

export class Router<StateT = Koa.DefaultState, ContextT = Koa.DefaultContext> {
	public koaRouter: KoaRouter = new KoaRouter()

	public use(...middleware: Array<KoaRouter.Middleware<StateT, ContextT>>) {
		// @ts-ignore
		return this.koaRouter.use(...middleware)
	}

	public get<P extends string>(
		path: P,
		callback: KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>
	) {
		return this.koaRouter.get(path, async (ctx) => {
			// @ts-ignore
			const responseValue = await callback(ctx, undefined)
			ctx.body = responseValue
		})
	}

	public post<P extends string>(
		path: P,
		callback: KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>
	) {
		return this.koaRouter.post(path, async (ctx) => {
			// @ts-ignore
			const responseValue = await callback(ctx, undefined)
			ctx.body = responseValue
		})
	}

	public put<P extends string>(
		path: P,
		callback: KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>
	) {
		return this.koaRouter.put(path, async (ctx) => {
			// @ts-ignore
			const responseValue = await callback(ctx, undefined)
			ctx.body = responseValue
		})
	}

	public delete<P extends string>(
		path: P,
		callback: KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>
	) {
		return this.koaRouter.delete(path, async (ctx) => {
			// @ts-ignore
			const responseValue = await callback(ctx, undefined)
			ctx.body = responseValue
		})
	}

	public del<P extends string>(
		path: P,
		callback: KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>
	) {
		return this.koaRouter.del(path, async (ctx) => {
			// @ts-ignore
			const responseValue = await callback(ctx, undefined)
			ctx.body = responseValue
		})
	}

	public patch<P extends string>(
		path: P,
		callback: KoaRouter.Middleware<StateT, ContextT & ExtractedRequestParams<P>>
	) {
		return this.koaRouter.patch(path, async (ctx) => {
			// @ts-ignore
			const responseValue = await callback(ctx, undefined)
			ctx.body = responseValue
		})
	}

	public routes() {
		return this.koaRouter.routes()
	}

	public allowedMethods() {
		return this.koaRouter.allowedMethods()
	}
}
