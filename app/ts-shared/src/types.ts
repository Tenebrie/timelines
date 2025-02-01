export type ShapeOfMessage<T> = {
	[K in keyof T]: {
		type: K
		data: T[K]
	}
}[keyof T]

export type ShapeOfMessageWithSession<T> = {
	[K in keyof T]: {
		type: K
		data: T[K]
		messageSourceSessionId: string | undefined
	}
}[keyof T]

export type ShapeOfHandler<T> = {
	[K in keyof T]: (data: T[K]) => void
}

export type ShapeOfHandlerWithSession<T> = {
	[K in keyof T]: (ctx: { data: T[K]; messageSourceSessionId: string | undefined }) => void
}

export type EmptyObject = Record<never, unknown>
