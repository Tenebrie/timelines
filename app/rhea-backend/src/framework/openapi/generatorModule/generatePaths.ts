/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ApiDocsPreferences } from '../manager/OpenApiManager'
import { EndpointData, PathDefinition } from '../types'
import { getSchema } from './getSchema'

export const generatePaths = (endpoints: EndpointData[], preferences: ApiDocsPreferences) => {
	const paths: Record<
		string,
		{
			get?: PathDefinition
			post?: PathDefinition
		}
	> = {}

	const { allowOptionalPathParams } = preferences

	endpoints.forEach((endpoint) => {
		const path = endpoint.path
			.split('/')
			.map((param) => {
				if (param.startsWith(':')) {
					return `{${param.substring(1).replace('?', '')}}`
				}
				return param
			})
			.join('/')

		const pathParams = endpoint.params.map((param) => ({
			name: param.identifier,
			in: 'path' as const,
			description: param.optional && !allowOptionalPathParams ? 'Optional parameter' : '',
			required: !allowOptionalPathParams || !param.optional,
			schema: getSchema(param.signature),
		}))

		const queryParams = endpoint.query.map((param) => ({
			name: param.identifier,
			in: 'query' as const,
			description: '',
			required: !param.optional,
			schema: getSchema(param.signature),
		}))

		const acceptedBodyTypes = {}

		if (endpoint.rawBody) {
			acceptedBodyTypes['text/plain'] = {
				schema: getSchema(endpoint.rawBody.signature),
			}
		}

		if (endpoint.objectBody.length > 0) {
			const properties = {}
			endpoint.objectBody.forEach((prop) => {
				properties[prop.identifier] = getSchema(prop.signature)
			})
			const required = endpoint.objectBody.filter((prop) => !prop.optional).map((prop) => prop.identifier)
			const content = {
				schema: {
					type: 'object',
					properties,
					required: required.length > 0 ? required : undefined,
				},
			}
			acceptedBodyTypes['application/json'] = content
			acceptedBodyTypes['application/x-www-form-urlencoded'] = content
		}

		const requestBody = endpoint.method === 'POST' ? { content: acceptedBodyTypes } : undefined

		const responses = {}
		endpoint.responses.forEach((response) => {
			const status = String(response.status)

			const existingSchemas = responses[status]
				? responses[status]['content']['application/json']['schema']['oneOf']
				: []

			responses[status] = {
				description: '',
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
			parameters: ([] as (typeof pathParams[number] | typeof queryParams[number])[])
				.concat(pathParams)
				.concat(queryParams),
			requestBody: requestBody,
			responses: responses,
		}

		paths[path] = {
			...paths[endpoint.path],
			[endpoint.method.toLowerCase()]: definition,
		}
	})

	return paths
}
