import { ApiDocsHeader, OpenApiManager } from '../openapi/manager/OpenApiManager'

export const useApiHeader = (docs: ApiDocsHeader) => {
	const openApiManager = OpenApiManager.getInstance()
	openApiManager.setHeader(docs)

	return docs
}
