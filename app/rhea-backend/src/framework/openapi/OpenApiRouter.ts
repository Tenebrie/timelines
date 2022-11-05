import * as path from 'path'
import { Project } from 'ts-morph'
import { Router } from '../Router'
import * as util from 'util'
import { EndpointData } from './types'
import { generatePaths } from './generatePaths'
import { parseEndpoint } from './parseEndpoint/parseEndpoint'
import { OpenApiManager } from '../OpenApiManager'

const project = new Project()
const sourceFilePaths = [path.resolve('./src/index.ts'), path.resolve('./src/routers/AuthRouter.ts')]
project.addSourceFilesAtPaths(sourceFilePaths)
project.resolveSourceFileDependencies()

const sourceFiles = sourceFilePaths.map((filePath) => project.getSourceFileOrThrow(filePath))

const pathToName = (path: string): string => {
	return path.replace(/\//g, '').replace(/:/g, '')
}

const openApiManager = OpenApiManager.getInstance()

const endpointData: EndpointData = {}

sourceFiles.forEach((sourceFile) =>
	sourceFile.forEachChild((node) => {
		// if (node.getText().includes('useApiInfo') && !node.getText().includes('import')) {
		// 	const targetNode = node
		// 		.getFirstDescendant((subnode) => subnode.getText() === 'useApiInfo')
		// 		.getFirstAncestorByKind(SyntaxKind.CallExpression)
		// 		.getChildAtIndex(2)

		// 	const params = syntaxListToValues(
		// 		targetNode.getChildAtIndex(0).getFirstChildByKind(SyntaxKind.SyntaxList)
		// 	)

		// 	const allowedValues = ['title', 'description', 'termsOfService', 'contact', 'license', 'version']
		// 	const deepValues = ['contact', 'license']
		// 	allowedValues.forEach((prop) => {
		// 		const matchingParam = params.find((param) => param.name === prop)
		// 		if (matchingParam) {
		// 			openApiData[prop] = matchingParam.value
		// 		}
		// 	})

		// 	const allowedDeepValues = ['name', 'url', 'email']
		// 	deepValues.forEach((prop) => {
		// 		const matchingParam = params.find((param) => param.name === prop)
		// 		if (matchingParam && typeof matchingParam.value === 'object') {
		// 			const subparam = matchingParam.value
		// 			openApiData[prop] = {}
		// 			allowedDeepValues.forEach((subprop) => {
		// 				const matchingSubparam = subparam.find((s) => s.name === subprop)
		// 				if (matchingSubparam) {
		// 					openApiData[prop][subprop] = matchingSubparam.value
		// 				}
		// 			})
		// 		}
		// 	})
		// }

		if (node.getText().includes('router.get') || node.getText().includes('router.post')) {
			const result = parseEndpoint(node)
			console.log('Here!!!')
			console.log(result)
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			endpointData[result.name] = result.data
		}
	})
)

const router = new Router()

router.get('/api-json', () => {
	const docsHeader = openApiManager.getHeader()
	const paths = generatePaths(endpointData)

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
		paths: paths,
	}
	return spec
})

// console.info(
// 	'[RHEA] Gathered OpenAPI data:',
// 	util.inspect(
// 		{
// 			...endpointData,
// 		},
// 		{ showHidden: false, depth: null, colors: true }
// 	)
// )

export const SwaggerRouter = router
