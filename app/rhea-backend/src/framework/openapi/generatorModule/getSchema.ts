import { ShapeOfProperty, ShapeOfType, ShapeOfUnion } from '@src/framework/openapi/analyzerModule/types'

export type SchemaType =
	| { type: string }
	| { type: string; properties: Record<string, SchemaType>; required: string[] }
	| { oneOf: SchemaType[] }

export const getSchema = (shape: string | ShapeOfType[]): SchemaType => {
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

	return {
		type: 'unknown_21',
	}
}
