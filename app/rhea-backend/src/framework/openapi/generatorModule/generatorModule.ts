import { generatePaths } from './generatePaths'
import { OpenApiManager } from '../manager/OpenApiManager'

export const generateOpenApiSpec = (manager: OpenApiManager) => {
	const header = manager.getHeader()
	const endpoints = manager.getEndpoints()

	return {
		openapi: '3.0.3',
		info: {
			title: header.title,
			description: header.description,
			termsOfService: header.termsOfService,
			contact: header.contact,
			license: header.license,
			version: header.version,
		},
		paths: generatePaths(endpoints, manager.getPreferences()),
	}
}
