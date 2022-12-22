import { generatePaths } from '../generatePaths'
import { OpenApiManager } from '../manager/OpenApiManager'

export const generateOpenApiSpec = () => {
	const openApiManager = OpenApiManager.getInstance()

	const header = openApiManager.getHeader()
	const endpoints = openApiManager.getEndpoints()

	return {
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
}
