export type ShapeOfType = ShapeOfProperty | ShapeOfUnion | ShapeOfUnionEntry | ShapeOfArray

export type ShapeOfProperty = {
	role: 'property'
	identifier: string
	shape: string | ShapeOfType[]
	optional: boolean
}

export type ShapeOfUnion = {
	role: 'union'
	shape: string | ShapeOfType[]
	optional: boolean
}

export type ShapeOfUnionEntry = {
	role: 'union_entry'
	shape: string | ShapeOfType[]
	optional: boolean
}

export type ShapeOfArray = {
	role: 'array'
	shape: string | ShapeOfType[]
	optional: boolean
}
