import * as path from 'path'
import { Project } from 'ts-morph'
import { Router } from '../Router'
import { generatePaths } from './generatePaths'
import { OpenApiManager } from '../OpenApiManager'
import { analyzeSourceFile } from './analyzeSourceFile'

const project = new Project({
	tsConfigFilePath: path.resolve('./tsconfig.json'),
})
const sourceFilePaths = [
	path.resolve('./src/index.ts'),
	path.resolve('./src/routers/UserRouter.ts'),
	path.resolve('./src/framework/openapi/OpenApiRouter.ts'),
]

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
	const openApiManager = OpenApiManager.getInstance()

	const header = openApiManager.getHeader()
	const endpoints = openApiManager.getEndpoints()

	const spec = {
		openapi: '3.0.0',
		info: {
			title: header.title,
			description: header.description,
			termsOfService: header.termsOfService,
			contact: header.contact,
			license: header.license,
			version: header.version,
		},
		paths: generatePaths(endpoints),
	}

	return spec
})

const openApiManager = OpenApiManager.getInstance()

const docsHeader = openApiManager.getHeader()

const sourceFiles = sourceFilePaths.map((filePath) => project.getSourceFileOrThrow(filePath))
const endpoints = sourceFiles.flatMap((sourceFile) => analyzeSourceFile(sourceFile))

openApiManager.setHeader(docsHeader)
openApiManager.setEndpoints(endpoints)

export const SwaggerRouter = router
