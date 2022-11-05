export type ApiEndpointDocs = {
	name?: string
	summary?: string
	description?: string
}

export const useApiEndpoint = (docs: ApiEndpointDocs) => {
	return docs
}
