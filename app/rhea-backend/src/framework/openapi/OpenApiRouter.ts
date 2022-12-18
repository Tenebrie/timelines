import * as path from 'path'
import { Project } from 'ts-morph'
import { Router } from '../Router'
import { generatePaths } from './generatePaths'
import { OpenApiManager } from '../OpenApiManager'
import { analyzeSourceFile } from './analyzeSourceFIle'

const project = new Project()
const sourceFilePaths = [path.resolve('./src/index.ts'), path.resolve('./src/routers/UserRouter.ts')]
project.addSourceFilesAtPaths(sourceFilePaths)
project.resolveSourceFileDependencies()

const router = new Router()

router.get('/api-json', () => {
	const openApiManager = OpenApiManager.getInstance()

	const docsHeader = openApiManager.getHeader()

	const sourceFiles = sourceFilePaths.map((filePath) => project.getSourceFileOrThrow(filePath))
	const endpoints = sourceFiles.flatMap((sourceFile) => analyzeSourceFile(sourceFile))

	const spec = {
		openapi: '3.0.0',
		info: {
			title: docsHeader.title,
			description: docsHeader.description,
			termsOfService: docsHeader.termsOfService,
			contact: docsHeader.contact,
			license: docsHeader.license,
			version: docsHeader.version,
		},
		paths: generatePaths(endpoints),
	}

	return spec
})

const openApiManager = OpenApiManager.getInstance()

const docsHeader = openApiManager.getHeader()

const sourceFiles = sourceFilePaths.map((filePath) => project.getSourceFileOrThrow(filePath))
const endpoints = sourceFiles.flatMap((sourceFile) => analyzeSourceFile(sourceFile))

export const SwaggerRouter = router
