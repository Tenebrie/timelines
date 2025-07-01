/* eslint-disable @typescript-eslint/no-explicit-any */
import { type AnyRouter, type RegisteredRouter, useMatch } from '@tanstack/react-router'
import type {
	ResolveUseParams,
	StrictOrFrom,
	ThrowConstraint,
	ThrowOrOptional,
	UseParamsResult,
} from '@tanstack/router-core'
import { Constrain, OptionalStructuralSharing, ValidateJSON } from '@tanstack/router-core'
export type DefaultStructuralSharingEnabled<TRouter extends AnyRouter> =
	boolean extends TRouter['options']['defaultStructuralSharing']
		? false
		: NonNullable<TRouter['options']['defaultStructuralSharing']>
export interface RequiredStructuralSharing<TStructuralSharing, TConstraint> {
	readonly structuralSharing: Constrain<TStructuralSharing, TConstraint>
}
export type StructuralSharingOption<
	TRouter extends AnyRouter,
	TSelected,
	TStructuralSharing,
> = unknown extends TSelected
	? OptionalStructuralSharing<TStructuralSharing, boolean>
	: unknown extends TRouter['routeTree']
		? OptionalStructuralSharing<TStructuralSharing, boolean>
		: TSelected extends ValidateJSON<TSelected>
			? OptionalStructuralSharing<TStructuralSharing, boolean>
			: DefaultStructuralSharingEnabled<TRouter> extends true
				? RequiredStructuralSharing<TStructuralSharing, false>
				: OptionalStructuralSharing<TStructuralSharing, false>
export type StructuralSharingEnabled<
	TRouter extends AnyRouter,
	TStructuralSharing,
> = boolean extends TStructuralSharing ? DefaultStructuralSharingEnabled<TRouter> : TStructuralSharing
export type ValidateSelected<TRouter extends AnyRouter, TSelected, TStructuralSharing> =
	StructuralSharingEnabled<TRouter, TStructuralSharing> extends true ? ValidateJSON<TSelected> : TSelected

export interface UseParamsBaseOptions<
	TRouter extends AnyRouter,
	TFrom,
	TStrict extends boolean,
	TThrow extends boolean,
	TSelected,
	TStructuralSharing,
> {
	select?: (
		params: ResolveUseParams<TRouter, TFrom, TStrict>,
	) => ValidateSelected<TRouter, TSelected, TStructuralSharing>
	shouldThrow?: TThrow
}
export type UseParamsOptions<
	TRouter extends AnyRouter,
	TFrom extends string | undefined,
	TStrict extends boolean,
	TThrow extends boolean,
	TSelected,
	TStructuralSharing,
> = StrictOrFrom<TRouter, TFrom, TStrict> &
	UseParamsBaseOptions<TRouter, TFrom, TStrict, TThrow, TSelected, TStructuralSharing> &
	StructuralSharingOption<TRouter, TSelected, TStructuralSharing>

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
		select: (match) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			return opts.select ? opts.select(match._strictParams) : match._strictParams
		},
	}) as any
}
