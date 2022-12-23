import * as Koa from 'koa'
import { prepareOpenApiSpec } from './analyzerModule/analyzerModule'
import { OpenApiRouter } from './router/OpenApiRouter'

type Props = {
	tsconfigPath: string
	sourceFilePaths: string[]
}

/**
 * Middleware to initialize the openApi engine.
 * Can be at any position in the middleware execution order.
 * @param props Paths to files relative to project root
 */
export const initOpenApiEngine = (props: Props) => {
	prepareOpenApiSpec(props.tsconfigPath, props.sourceFilePaths)

	const builtInRoutes = OpenApiRouter.routes()
	const builtInAllowedMethods = OpenApiRouter.allowedMethods()
	return (ctx: Koa.ParameterizedContext<any, any>, next: Koa.Next) => {
		return builtInRoutes(ctx, () => builtInAllowedMethods(ctx, next))
	}
}
