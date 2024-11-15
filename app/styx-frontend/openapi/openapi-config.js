'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
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
			exportName: 'adminApi',
			filterEndpoints: pathMatcher(/api\/admin/i),
		},
		'../src/api/announcementsApi.ts': {
			exportName: 'announcementsApi',
			filterEndpoints: pathMatcher(/api\/announcements/i),
		},
		'../src/api/authApi.ts': {
			exportName: 'authApi',
			filterEndpoints: pathMatcher(/api\/auth/i),
		},
		'../src/api/constantsApi.ts': {
			exportName: 'constantsApi',
			filterEndpoints: pathMatcher(/api\/constants/i),
		},
		'../src/api/worldApi.ts': {
			exportName: 'worldApi',
			filterEndpoints: pathMatcher(/api\/world/i),
		},
		'../src/api/otherApi.ts': {
			exportName: 'otherApi',
			filterEndpoints: pathMatcher(/health/i),
		},
	},
	tag: true,
	hooks: {
		queries: true,
		lazyQueries: true,
		mutations: true,
	},
}
exports.default = config
