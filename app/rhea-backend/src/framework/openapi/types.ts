type PathParam = {
	name: string
	in: 'query' | 'path'
	description: string
	required: boolean
}

export type PathDefinition = {
	summary: string | undefined
	description: string
	operationId: string | undefined
	parameters: PathParam[]
	requestBody: any
	responses: any
}

export type EndpointData = {
	method: 'GET' | 'POST'
	path: string
	name?: string
	summary?: string
	description?: string
	params: {
		identifier: string
		signature: string
		optional: boolean
	}[]
	query: {
		identifier: string
		signature: string
		optional: boolean
	}[]
	body: {
		identifier: string
		signature: string | Record<string, string>
		required: boolean
	}[]
	responses: {
		status: number
		signature: string | Record<string, string>
	}[]
}
