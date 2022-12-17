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
		name: string
		signature: string
	}[]
	body: {
		name: string
		signature: string | Record<string, string>
		required: boolean
	}[]
	responses: {
		status: number
		signature: string | Record<string, string>
	}[]
}
