export const enum RheaToCalliopeChannel {
	WORLD_UPDATED = 'worldUpdate',
}

export type RheaToCalliopeMessageData = {
	[RheaToCalliopeChannel.WORLD_UPDATED]: {
		userId: string
		worldId: string
		timestamp: string
	}
}

type MapToMessageReceiver<T> = {
	[K in keyof T]: (data: T[K]) => void
}

type MapToMessage<T> = {
	[K in keyof T]: {
		channel: K
		data: T[K]
	}
}[keyof T]

export type RheaToCalliopeMessage = MapToMessage<RheaToCalliopeMessageData>
export type RheaToCalliopeMessageReceiver = MapToMessageReceiver<RheaToCalliopeMessageData>
