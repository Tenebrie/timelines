type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends Array<infer U>
		? Array<DeepPartial<U>>
		: T[P] extends ReadonlyArray<infer U>
		? ReadonlyArray<DeepPartial<U>>
		: DeepPartial<T[P]>
}

type ValidatorArg<T> = T extends object ? DeepPartial<T> : T

export type Validator<T> = {
	prevalidate?: (v: string) => boolean
	rehydrate: (v: string) => T
	validate?: (v: ValidatorArg<T>) => boolean
	optional: boolean
}

export const RequestParam = <T>(
	validator: Omit<Validator<T>, 'optional'>
): Validator<T> & { optional: false } => ({
	...validator,
	optional: false,
})

export const RequiredParam = <T>(
	validator: Omit<Validator<T>, 'optional'>
): Validator<T> & { optional: false } => ({
	...validator,
	optional: false,
})

export const OptionalParam = <T>(
	validator: Omit<Validator<T>, 'optional'>
): Validator<T> & { optional: true } => ({
	...validator,
	optional: true,
})

export const NonEmptyString = RequiredParam<string>({
	rehydrate: (v) => v,
	validate: (v) => v.length > 0,
})
export const NonEmptyNumber = RequiredParam<number>({
	rehydrate: (v) => Number(v),
})
export const EmailString = RequiredParam<string>({
	rehydrate: (v) => v,
	validate: (v) => v.includes('@'),
})
export const StringWithFiveCharactersOrMore = RequiredParam<string>({
	rehydrate: (v) => v,
	validate: (v) => v.length > 5,
})
export const FooBarObjectValidator = RequiredParam<{ foo: string; bar: string }>({
	prevalidate: (v) => v.length > 5,
	rehydrate: (v) => JSON.parse(v),
	validate: (v) => (v.foo?.length ?? 0) > 2 && (v.bar?.length ?? 0) > 2,
})
export const BooleanValidator = RequiredParam({
	prevalidate: (v) => v === '0' || v === '1' || v === 'false' || v === 'true',
	rehydrate: (v) => v === '1' || v === 'true',
})
export const StringValidator = RequiredParam<string>({
	rehydrate: (v) => v,
})
export const NumberValidator = RequiredParam<number>({
	rehydrate: (v) => Number(v),
	validate: (v) => !isNaN(v),
})
