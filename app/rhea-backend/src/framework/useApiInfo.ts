type UrlType = `${'http' | 'https'}://${string}.${string}`

export type ApiInfo = {
	title: string
	description?: string
	termsOfService?: UrlType
	contact?: {
		name?: string
		url?: UrlType
		email?: string
	}
	license?: {
		name?: string
		url?: UrlType
	}
	version: string
}

export const useApiInfo = (docs: ApiInfo) => {
	return docs
}
