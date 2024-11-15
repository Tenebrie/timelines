//import type { ConfigFile } from '@rtk-query/codegen-openapi'

const pathMatcher = (pattern) => {
	return (operationName, operationDefinition) => {
		return pattern.test(operationDefinition.path)
	}
}

const config = {
	schemaFile: 'http://localhost:3000/api-json',
	apiFile: '../src/api/baseApi.ts',
	apiImport: 'baseApi',
	outputFiles: {
		'../src/api/adminApi.ts': {
			filterEndpoints: pathMatcher(/api\/admin/i),
		},
		'../src/api/announcementsApi.ts': {
			filterEndpoints: [/api\/announcements/i],
		},
		'../src/api/authApi.ts': {
			filterEndpoints: [/api\/auth/i],
		},
		'../src/api/constantsApi.ts': {
			filterEndpoints: [/api\/constants/i],
		},
		'../src/api/worldApi.ts': {
			filterEndpoints: [/api\/world/i],
		},
		'../src/api/otherApi.ts': {
			filterEndpoints: [/api/i],
		},
	},
	exportName: 'rheaApi',
	tag: true,
	hooks: {
		queries: true,
		lazyQueries: true,
		mutations: true,
	},
}

export default config
