export enum QueryStrategy {
	Clear = '[[[clear]]]',
	Preserve = '[[[preserve]]]',
}

export type GenericArgsOrVoid<Q> =
	Q extends Record<string, never>
		? { args?: void }
		: Q extends Record<string, string>
			? { args: Q }
			: { args?: void }

export type GenericQueryOrVoid<Q> = Q extends undefined
	? { query?: void }
	: { query?: Partial<Record<keyof Q, string | number | QueryStrategy | null>> }
