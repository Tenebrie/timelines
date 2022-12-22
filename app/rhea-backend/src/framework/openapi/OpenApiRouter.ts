import { Router } from '../router/Router'
import { generatePaths } from './generatePaths'
import { OpenApiManager } from './manager/OpenApiManager'
import { generateOpenApiSpec } from './generatorModule/generatorModule'
import { prepareOpenApiSpec } from './analyzerModule/analyzerModule'

const router = new Router()

router.get('/api', () => {
	const openApiManager = OpenApiManager.getInstance()
	const endpoints = openApiManager.getEndpoints()

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const util = require('util')
	const inspectedObject = util.inspect(endpoints, { showHidden: false, depth: null, colors: false }) as string
	return inspectedObject
})

router.get('/api-json', () => {
	const spec = generateOpenApiSpec()

	return spec
})

const paths = ['./src/index.ts', './src/routers/UserRouter.ts', './src/framework/openapi/OpenApiRouter.ts']
prepareOpenApiSpec('./tsconfig.json', paths)

export const SwaggerRouter = router
