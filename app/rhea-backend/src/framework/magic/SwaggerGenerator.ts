import * as path from 'path'
import { Project, Node } from 'ts-morph'
import { SyntaxKind, SyntaxList } from 'typescript'
import { Router } from '../Router'
import { ApiInfo } from '../useApiInfo'
import { footprintOfTypeWithoutFormatting } from './footprintOfType'
import { assignmentToLiteralValue } from './utils/assignmentToLiteralValue/assignmentToLiteralValue'
import { syntaxListToValues } from './utils/syntaxListToValues/syntaxListToValues'
import { unwrapQuotes } from './utils/unwrapQuotes/unwrapQuotes'

const project = new Project()
const sourceFilePaths = [path.resolve('./src/index.ts'), path.resolve('./src/routers/AuthRouter.ts')]
project.addSourceFilesAtPaths(sourceFilePaths)
project.resolveSourceFileDependencies()

const sourceFiles = sourceFilePaths.map((filePath) => project.getSourceFileOrThrow(filePath))

const openApiData: ApiInfo = {
	title: 'Default Title',
	version: '1.0.0',
}

const endpointData: Record<
	string,
	{
		method: 'GET' | 'POST'
		name?: string
		summary?: string
		description?: string
		params: {
			name: string
			signature: string | Record<string, string>
		}[]
		body: {
			name: string
			signature: string | Record<string, string>
		}[]
	}
> = {}

sourceFiles.forEach((sourceFile) =>
	sourceFile.forEachChild((node) => {
		if (node.getText().includes('useApiInfo') && !node.getText().includes('import')) {
			const targetNode = node
				.getFirstDescendant((subnode) => subnode.getText() === 'useApiInfo')
				.getFirstAncestorByKind(SyntaxKind.CallExpression)
				.getChildAtIndex(2)

			const params = syntaxListToValues(
				targetNode.getChildAtIndex(0).getFirstChildByKind(SyntaxKind.SyntaxList),
				{
					quotes: false,
				}
			)

			console.log(params)

			const allowedValues = ['title', 'description', 'termsOfService', 'contact', 'license', 'version']
			const deepValues = ['contact', 'license']
			allowedValues.forEach((prop) => {
				const matchingParam = params.find((param) => param.name === prop)
				if (matchingParam) {
					openApiData[prop] = matchingParam.value
				}
			})

			const allowedDeepValues = ['name', 'url', 'email']
			deepValues.forEach((prop) => {
				const matchingParam = params.find((param) => param.name === prop)
				if (matchingParam && typeof matchingParam.value === 'object') {
					const subparam = matchingParam.value
					openApiData[prop] = {}
					allowedDeepValues.forEach((subprop) => {
						const matchingSubparam = subparam.find((s) => s.name === subprop)
						if (matchingSubparam) {
							openApiData[prop][subprop] = matchingSubparam.value
						}
					})
				}
			})
		}

		if (node.getText().includes('router.get') || node.getText().includes('router.post')) {
			const endpointMethod = node
				.getFirstDescendantByKind(SyntaxKind.PropertyAccessExpression)
				.getText()
				.split('.')[1]
				.toUpperCase()

			const endpointText = node.getFirstDescendantByKind(SyntaxKind.StringLiteral).getText()
			const endpointName = endpointText.substring(1, endpointText.length - 1)

			endpointData[endpointName] = {
				method: endpointMethod as 'GET' | 'POST',
				params: [],
				body: [],
			}

			// API documentation
			try {
				const targetNode = node
					.getFirstDescendant((subnode) => subnode.getText() === 'useApiDocs')
					.getFirstAncestorByKind(SyntaxKind.CallExpression)
					.getChildAtIndex(2)

				const params = syntaxListToValues(
					targetNode.getChildAtIndex(0).getFirstChildByKind(SyntaxKind.SyntaxList),
					{ quotes: false }
				)

				const allowedValues = ['name', 'summary', 'description']
				allowedValues.forEach((prop) => {
					const matchingParam = params.find((param) => param.name === prop)
					if (matchingParam) {
						endpointData[endpointName][prop] = matchingParam.value
					}
				})
			} catch (err) {
				// Tis fine
			}

			// Request params
			try {
				const rawParams = footprintOfTypeWithoutFormatting({
					node,
					type: node
						.getFirstDescendant((subnode) => subnode.getText() === 'useRequestParams')
						.getFirstAncestorByKind(SyntaxKind.CallExpression)
						.getReturnType(),
				})

				const jsonParams = JSON.parse(rawParams)

				const params: typeof endpointData[string]['params'] = Object.keys(jsonParams).map((key) => ({
					name: key,
					signature: jsonParams[key],
				}))

				endpointData[endpointName] = {
					...endpointData[endpointName],
					params,
				}
			} catch (err) {
				// Tis fine
			}

			// Request body
			try {
				const rawBody = footprintOfTypeWithoutFormatting({
					node,
					type: node
						.getFirstDescendant((subnode) => subnode.getText() === 'useRequestBody')
						.getFirstAncestorByKind(SyntaxKind.CallExpression)
						.getReturnType(),
				})

				const jsonBody = JSON.parse(rawBody)

				const body: typeof endpointData[string]['body'] = Object.keys(jsonBody).map((key) => ({
					name: key,
					signature: jsonBody[key],
				}))

				endpointData[endpointName] = {
					...endpointData[endpointName],
					body,
				}
			} catch (err) {
				// Tis fine
			}
		}
	})
)

const router = new Router()

type PathParam = {
	name: string
	in: 'query' | 'path'
	description: string
	required: boolean
}

type PathDefinition = {
	summary: string
	description: string
	operationId: string
	parameters: PathParam[]
	requestBody: any
	responses: any
}

const paramsToSchema = (
	params: {
		name: string
		signature: string | Record<string, string>
	}[]
) => {
	const schemas = {}

	params.forEach((param) => {
		if (typeof param.signature === 'string') {
			schemas[param.name] = {
				type: param.signature,
			}
			return
		}

		const properties = {}
		for (const paramKey in param.signature) {
			const paramValue = param.signature[paramKey]
			properties[paramKey] = {
				type: paramValue,
			}
		}

		schemas[param.name] = {
			type: 'object',
			properties: properties,
		}
	})

	return schemas
}

router.get('/api-json', (ctx) => {
	const paths: Record<
		string,
		{
			get?: PathDefinition
			post?: PathDefinition
		}
	> = {}

	for (const key in endpointData) {
		const endpoint = endpointData[key]

		const definition: PathDefinition = {
			operationId: endpoint.name,
			summary: endpoint.summary,
			description: endpoint.description ?? '',
			parameters: endpoint.params.map((param) => ({
				name: param.name,
				in: 'path',
				description: '',
				required: true,
				schema: {
					$ref: `#/components/schemas/${param.name}`,
				},
			})),
			requestBody:
				endpoint.body.length === 0
					? undefined
					: {
							content: {
								'application/json': {
									schema: {
										type: 'object',
										properties: paramsToSchema(endpoint.body),
									},
								},
							},
					  },
			responses: {
				'200': {
					description: '',
				},
			},
		}

		const path = key
			.split('/')
			.map((param) => {
				if (param.startsWith(':')) {
					return `{${param.substring(1)}}`
				}
				return param
			})
			.join('/')

		paths[path] = {
			...paths[key],
			[endpoint.method.toLowerCase()]: definition,
		}
	}

	let schemas = {}

	for (const key in endpointData) {
		const endpoint = endpointData[key]

		const schema = paramsToSchema(endpoint.params)
		schemas = {
			...schemas,
			...schema,
		}
	}

	const spec = {
		openapi: '3.0.0',
		info: {
			title: openApiData.title,
			description: openApiData.description,
			termsOfService: openApiData.termsOfService,
			contact: openApiData.contact,
			license: openApiData.license,
			version: openApiData.version,
		},
		paths: paths,
		components: {
			schemas: schemas,
		},
	}
	ctx.body = spec
})

console.info('[RHEA] Gathered OpenAPI data:', {
	...openApiData,
	endpoints: endpointData,
})

export const SwaggerRouter = router
