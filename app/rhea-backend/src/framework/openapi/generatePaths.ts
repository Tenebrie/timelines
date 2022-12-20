/* eslint-disable @typescript-eslint/ban-ts-comment */
import { EndpointData, PathDefinition } from './types'
import { getSchema, paramsToSchema, singleParamToSchema } from './utils/getSchema/getSchema'

export const generatePaths = (endpoints: EndpointData[]) => {
	const paths: Record<
		string,
		{
			get?: PathDefinition
			post?: PathDefinition
		}
	> = {}

	endpoints.forEach((endpoint) => {
		const responses = {}
		endpoint.responses.forEach((response) => {
			const status = String(response.status)

			const existingSchemas = responses[status]
				? responses[status]['content']['application/json']['schema']['oneOf']
				: []

			responses[status] = {
				description: 'No description',
				content: {
					'application/json': {
						schema: {
							oneOf: [...existingSchemas, getSchema(response.signature)],
						},
					},
				},
			}
		})

		const definition: PathDefinition = {
			operationId: endpoint.name,
			summary: endpoint.summary,
			description: endpoint.description ?? '',
			parameters: endpoint.params.map((param) => ({
				name: param.identifier,
				in: 'path',
				description: '',
				required: true,
				// @ts-ignore
				schema: singleParamToSchema(param),
			})),
			requestBody:
				endpoint.jsonBody.length === 0
					? undefined
					: {
							content: {
								'application/json': {
									schema: {
										type: 'object',
										// @ts-ignore
										properties: paramsToSchema(endpoint.body),
										required: endpoint.jsonBody
											.filter((value) => value.signature !== 'undefined')
											.filter((value) => !value.optional)
											.map((value) => value.identifier),
									},
								},
							},
					  },
			responses: responses,
		}

		const path = endpoint.path
			.split('/')
			.map((param) => {
				if (param.startsWith(':')) {
					return `{${param.substring(1)}}`
				}
				return param
			})
			.join('/')

		paths[path] = {
			...paths[endpoint.path],
			[endpoint.method.toLowerCase()]: definition,
		}
	})

	return paths
}
