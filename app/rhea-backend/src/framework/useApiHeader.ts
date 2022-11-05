import { ApiDocsHeader, OpenApiManager } from './OpenApiManager'

export const useApiHeader = (docs: ApiDocsHeader) => {
	const openApiManager = OpenApiManager.getInstance()
	openApiManager.setHeader(docs)

	return docs
}
