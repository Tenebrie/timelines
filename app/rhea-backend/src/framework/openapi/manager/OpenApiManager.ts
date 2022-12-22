import { EndpointData } from '../types'

type UrlType = `${'http' | 'https'}://${string}.${string}`

export type ApiDocsHeader = {
	title: string
	version: string
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
}

export class OpenApiManager {
	private static instance: OpenApiManager | null = null

	constructor(public apiDocsHeader: ApiDocsHeader, public endpoints: EndpointData[]) {}

	public getHeader(): ApiDocsHeader {
		return this.apiDocsHeader
	}

	public setHeader(docs: ApiDocsHeader) {
		this.apiDocsHeader = docs
	}

	public getEndpoints() {
		return this.endpoints
	}

	public setEndpoints(endpoints: EndpointData[]) {
		this.endpoints = endpoints
	}

	public static getInstance() {
		if (!OpenApiManager.instance) {
			OpenApiManager.instance = new OpenApiManager(
				{
					title: 'Default title',
					version: '1.0.0',
				},
				[]
			)
		}
		return OpenApiManager.instance
	}
}
