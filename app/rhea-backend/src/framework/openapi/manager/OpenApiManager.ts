import { Router } from '@src/framework/router/Router'
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

export type ApiDocsPreferences = {
	allowOptionalPathParams: boolean
}

export class OpenApiManager {
	private static instance: OpenApiManager | null = null

	private isInitialized = false
	private registeredRouters: Router[] = []

	constructor(
		private apiDocsHeader: ApiDocsHeader,
		private endpoints: EndpointData[],
		private preferences: ApiDocsPreferences
	) {}

	public isReady(): boolean {
		return this.isInitialized
	}

	public initialize(endpoints: EndpointData[]) {
		this.endpoints = endpoints
		this.isInitialized = true
	}

	public getHeader(): ApiDocsHeader {
		return this.apiDocsHeader
	}

	public setHeader(docs: ApiDocsHeader) {
		this.apiDocsHeader = docs
	}

	public getEndpoints() {
		return this.endpoints
	}

	public getPreferences() {
		return this.preferences
	}

	public setPreferences(preferences: ApiDocsPreferences) {
		this.preferences = {
			...preferences,
		}
	}

	public getRouters(): readonly Router[] {
		return this.registeredRouters
	}

	public registerRouter(router: Router<any, any>) {
		this.registeredRouters.push(router)
	}

	public static getInstance() {
		if (!OpenApiManager.instance) {
			OpenApiManager.instance = new OpenApiManager(
				{
					title: 'Default title',
					version: '1.0.0',
				},
				[],
				{
					allowOptionalPathParams: false,
				}
			)
		}
		return OpenApiManager.instance
	}
}
