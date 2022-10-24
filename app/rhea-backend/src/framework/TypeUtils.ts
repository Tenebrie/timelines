type ElementType<T> = T extends ReadonlyArray<infer U> ? ElementType<U> : T

type PrependTuple<A, T extends Array<any>> = A extends undefined
	? T
	: ((a: A, ...b: T) => void) extends (...a: infer I) => void
	? I
	: []

export type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0
	? undefined
	: ((...b: T) => void) extends (a, ...b: infer I) => void
	? I
	: []

type FirstFromTuple<T extends any[]> = T['length'] extends 0 ? undefined : T[0]

type NumberToTuple<N extends number, L extends Array<any> = []> = {
	true: L
	false: NumberToTuple<N, PrependTuple<1, L>>
}[L['length'] extends N ? 'true' : 'false']

type Decrease<I extends number> = RemoveFirstFromTuple<NumberToTuple<I>>['length']

type Iter<N extends number, Items extends any[], L extends Array<any> = []> = {
	true: L
	false: Iter<
		FirstFromTuple<Items> extends undefined ? Decrease<N> : N,
		RemoveFirstFromTuple<Items>,
		PrependTuple<FirstFromTuple<Items>, L>
	>
}[L['length'] extends N ? 'true' : 'false']

export type SplitStringBy<S extends string, D extends string> = string extends S
	? string[]
	: S extends ''
	? []
	: S extends `${infer T}${D}${infer U}`
	? [T, ...SplitStringBy<U, D>]
	: [S]

type PickParams<S extends string[], P extends string> = S['length'] extends 0
	? []
	: S[0] extends `${P}${string}`
	? [S[0], ...PickParams<RemoveFirstFromTuple<S>, P>]
	: PickParams<RemoveFirstFromTuple<S>, P>

export type Substring<S extends string[]> = S['length'] extends 0
	? []
	: [SplitStringBy<S[0], ':'>[1], ...Substring<RemoveFirstFromTuple<S>>]

export type ExtractedRequestParams<S extends string> = {
	parsedPathParams: PickParams<SplitStringBy<S, '/'>, ':'>
}
