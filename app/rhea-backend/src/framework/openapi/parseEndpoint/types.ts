export type ShapeOfType = ShapeOfProperty | ShapeOfUnion | ShapeOfArray

export type ShapeOfProperty = {
	role: 'property'
	identifier: string
	shape: string | ShapeOfType[]
	optional: boolean
}

export type ShapeOfUnion = {
	role: 'union'
	shape: string | ShapeOfType[]
	optional: false
}

export type ShapeOfArray = {
	role: 'array'
	shape: string | ShapeOfType[]
	optional: boolean
}
