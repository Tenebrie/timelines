export type ApiDocs = {
	name?: string
	summary?: string
	description?: string
}

export const useApiDocs = (docs: ApiDocs) => {
	return docs
}
