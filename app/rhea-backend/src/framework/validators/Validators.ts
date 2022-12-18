export type Validator<T> = {
	prevalidate?: (v: string) => boolean
	rehydrate: (v: string) => T
	validate?: (v: T) => boolean
	optional: boolean
}

export const RequestParam = <T>(validator: Omit<Validator<T>, 'optional'>): Validator<T> => ({
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

export const NonEmptyString: Validator<string> = {
	rehydrate: (v) => v,
	validate: (v) => v.length > 0,
	optional: false,
}
export const NonEmptyNumber: Validator<number> = {
	rehydrate: (v) => Number(v),
	optional: false,
}
export const EmailString: Validator<string> = {
	rehydrate: (v) => v,
	validate: (v) => v.includes('@'),
	optional: false,
}
export const StringWithFiveCharactersOrMore: Validator<string> = {
	rehydrate: (v) => v,
	validate: (v) => v.length > 5,
	optional: false,
}
export const FooBarObjectValidator: Validator<{ foo: string; bar: string }> = {
	prevalidate: (v) => v.length > 5,
	rehydrate: (v) => JSON.parse(v),
	validate: (v) => v.foo.length > 2 && v.bar.length > 2,
	optional: false,
}
export const BooleanValidator: Validator<boolean> = {
	prevalidate: (v) => v === '0' || v === '1' || v === 'false' || v === 'true',
	rehydrate: (v) => v === '1' || v === 'true',
	optional: false,
}
export const StringValidator: Validator<string> = {
	rehydrate: (v) => v,
	optional: false,
}
export const NumberValidator: Validator<number> = {
	rehydrate: (v) => Number(v),
	validate: (v) => !isNaN(v),
	optional: false,
}
