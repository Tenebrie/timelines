export type ShapeOfMessage<T> = {
	[K in keyof T]: {
		type: K
		data: T[K]
	}
}[keyof T]

export type ShapeOfHandler<T> = {
	[K in keyof T]: (data: T[K]) => void
}

export type EmptyObject = {
	/* Empty */
}
