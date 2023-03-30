import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
	schemaFile: 'http://localhost:3000/api-json',
	//apiFile: './src/store/emptyApi.ts',
	apiFile: '../src/api/baseApi.ts',
	apiImport: 'baseApi',
	outputFile: '../src/api/rheaApi.ts',
	exportName: 'rheaApi',
	tag: true,
	hooks: {
		queries: true,
		lazyQueries: true,
		mutations: true,
	},
}

export default config
