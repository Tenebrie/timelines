export type SplitStringBy<S extends string, D extends string> = string extends S
	? string[]
	: S extends ''
		? []
		: S extends `${infer T}${D}${infer U}`
			? [T, ...SplitStringBy<U, D>]
			: [S]

type RemoveLeadingColonWrapper<S extends string | undefined> = S extends string
	? RemoveLeadingColon<S>
	: never
type RemoveLeadingColon<S extends string> = S['length'] extends 0 ? never : SplitStringBy<S, ':'>[1]
type RemoveTrailingQuestion<S extends string> = S['length'] extends 0 ? never : SplitStringBy<S, '?'>[0]
export type CleanUpPathParam<S> = S extends string
	? RemoveLeadingColonWrapper<RemoveTrailingQuestion<S>> extends string
		? RemoveLeadingColonWrapper<RemoveTrailingQuestion<S>>
		: never
	: never
export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>
		}
	: T
