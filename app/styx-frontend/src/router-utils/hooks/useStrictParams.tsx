/* eslint-disable @typescript-eslint/no-explicit-any */
import { type AnyRouter, type RegisteredRouter, useMatch } from '@tanstack/react-router'
import { ThrowConstraint } from '@tanstack/react-router/dist/esm/useMatch'
import type {
	ResolveParams,
	UseParamsOptions,
	UseParamsResult,
} from '@tanstack/react-router/dist/esm/useParams'
import type { ThrowOrOptional } from '@tanstack/router-core'

export function useStrictParams<
	TRouter extends AnyRouter = RegisteredRouter,
	const TFrom extends string | undefined = undefined,
	TStrict extends boolean = true,
	TThrow extends boolean = true,
	TSelected = unknown,
	TStructuralSharing extends boolean = boolean,
>(
	opts: UseParamsOptions<
		TRouter,
		TFrom,
		TStrict,
		ThrowConstraint<TStrict, TThrow>,
		TSelected,
		TStructuralSharing
	>,
): ThrowOrOptional<UseParamsResult<TRouter, TFrom, TStrict, TSelected>, TThrow> {
	return useMatch({
		from: opts.from!,
		strict: opts.strict,
		shouldThrow: opts.shouldThrow,
		structuralSharing: opts.structuralSharing,
		// @ts-ignore
		select: (match: ResolveParams<TRouter, TFrom, TStrict>) => {
			return opts.select ? opts.select(match._strictParams) : match._strictParams
		},
	}) as any
}
