/* eslint-disable @typescript-eslint/ban-ts-comment */
export type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0
	? undefined
	: ((...b: T) => void) extends (a, ...b: infer I) => void
	? I
	: []

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
	? // @ts-ignore
	  [S[0], ...PickParams<RemoveFirstFromTuple<S>, P>]
	: // @ts-ignore
	  PickParams<RemoveFirstFromTuple<S>, P>

export type Substring<S extends string[]> = S['length'] extends 0
	? []
	: // @ts-ignore
	  [SplitStringBy<S[0], ':'>[1], ...Substring<RemoveFirstFromTuple<S>>]

export type ExtractedRequestParams<S extends string> = {
	parsedPathParams: PickParams<SplitStringBy<S, '/'>, ':'>
}
