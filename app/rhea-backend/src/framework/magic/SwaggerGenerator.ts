import * as path from 'path'
import { Project } from 'ts-morph'
import { SyntaxKind } from 'typescript'
import { Router } from '../Router'
import { footprintOfTypeWithoutFormatting } from './footprintOfType'

const project = new Project()
const routerPath = path.resolve('./src/routers/AuthRouter.ts')
project.addSourceFilesAtPaths(routerPath)
project.resolveSourceFileDependencies()

const sourceFile = project.getSourceFileOrThrow(routerPath)

// sourceFile
// 	.getDescendantsOfKind(SyntaxKind.TypeAliasDeclaration)
// 	.forEach((a) => console.log(a.getFirstDescendantByKind(SyntaxKind.TypeReference)?.getText()))

const endpointData: Record<
	string,
	{
		method: 'GET' | 'POST'
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

sourceFile.forEachChild((node) => {
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

const router = new Router()

type PathParam = {
	name: string
	in: 'query' | 'path'
	description: string
	required: boolean
}

type PathDefinition = {
	summary: string
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
			summary: '',
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
			version: '1.0.0',
			title: 'Amazing Spec',
			license: {
				name: 'MIT',
			},
		},
		paths: paths,
		components: {
			schemas: schemas,
		},
	}
	ctx.body = spec
})

export const SwaggerRouter = router
