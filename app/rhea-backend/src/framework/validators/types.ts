type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends Array<infer U>
		? Array<DeepPartial<U>>
		: T[P] extends ReadonlyArray<infer U>
		? ReadonlyArray<DeepPartial<U>>
		: DeepPartial<T[P]>
}

export type ValidateArg<T> = T extends object ? DeepPartial<T> : T

export type Validator<T> = {
	prevalidate?: (v: string) => boolean
	rehydrate: (v: string) => T
	validate?: (v: ValidateArg<T>) => boolean
	optional: boolean
}
