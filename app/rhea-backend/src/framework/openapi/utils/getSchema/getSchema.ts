export const getSchema = (
	value:
		| string
		| Record<string, any>
		| {
				name: string
				signature: string | Record<string, string>
		  }[]
) => {
	if (typeof value === 'object' && !Array.isArray(value)) {
		const shuffledValues: {
			name: string
			signature: any
		}[] = []

		for (const propName in value) {
			const propValue = value[propName]
			shuffledValues.push({
				name: propName,
				signature: propValue,
			})
		}
		return {
			type: 'object',
			properties: paramsToSchema(shuffledValues),
			required: shuffledValues.filter((value) => value.signature !== 'undefined').map((value) => value.name),
		}
	}

	if (typeof value === 'object' && Array.isArray(value)) {
		return paramsToSchema(value)
	}

	return {
		type: 'string',
	}
}

export const singleParamToSchema = (param: { name: string; signature: string | Record<string, string> }) => {
	if (param.signature === 'undefined') {
		return
	}

	if (typeof param.signature === 'string') {
		return {
			type: 'string',
			example: param.signature,
		}
	}

	if (typeof param.signature === 'number') {
		return {
			type: 'number',
			example: param.signature,
		}
	}

	const properties = {}
	for (const paramKey in param.signature) {
		const paramValue = param.signature[paramKey]
		properties[paramKey] = getSchema(paramValue)
	}

	return {
		type: 'object',
		properties: properties,
	}
}

export const paramsToSchema = (
	params: {
		name: string
		signature: string | Record<string, string>
	}[]
) => {
	const schemas = {}

	params.forEach((param) => {
		schemas[param.name] = singleParamToSchema(param)
	})

	return schemas
}
