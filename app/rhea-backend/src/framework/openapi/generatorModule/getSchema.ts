import {
	ShapeOfProperty,
	ShapeOfRecord,
	ShapeOfType,
	ShapeOfUnion,
} from '@src/framework/openapi/analyzerModule/types'

export type SchemaType =
	| { type: string }
	| { type: string; properties: Record<string, SchemaType>; required: string[] }
	| { oneOf: SchemaType[] }
	| { type: 'array'; items: SchemaType }
	| { type: 'object'; additionalProperties: SchemaType }

export const getSchema = (shape: string | ShapeOfType[]): SchemaType => {
	if (typeof shape === 'string' && shape === 'any') {
		return generateAny()
	}

	if (typeof shape === 'string' && shape === 'circular') {
		return generateAny()
	}

	if (typeof shape === 'string') {
		return {
			type: shape,
		}
	}

	if (shape.length === 0) {
		return {
			type: 'unknown_20',
		}
	}

	const isObject = shape[0].role === 'property'
	if (isObject) {
		const typedShapes = shape as ShapeOfProperty[]
		const properties = {}
		typedShapes.forEach((prop) => {
			properties[prop.identifier] = getSchema(prop.shape)
		})
		const required = typedShapes.filter((prop) => !prop.optional).map((prop) => prop.identifier)
		return {
			type: 'object',
			properties,
			required: required.length > 0 ? required : undefined,
		}
	}

	const isUnion = shape[0].role === 'union'
	if (isUnion) {
		const typedShape = shape[0] as ShapeOfUnion
		return {
			oneOf: typedShape.shape.map((unionEntry) => getSchema(unionEntry.shape)),
		}
	}

	const isRecord = shape[0].role === 'record'
	if (isRecord) {
		const recordShape = shape[0] as ShapeOfRecord
		return {
			type: 'object',
			additionalProperties: getSchema(recordShape.shape),
		}
	}

	const isArray = shape[0].role === 'array'
	if (isArray) {
		return {
			type: 'array',
			items: getSchema(shape[0].shape),
		}
	}

	return {
		type: 'unknown_21',
	}
}

const generateAny = () => ({
	oneOf: [
		{
			type: 'string',
		},
		{
			type: 'boolean',
		},
		{
			type: 'number',
		},
		{
			type: 'object',
		},
		{
			type: 'array',
		},
	],
})
