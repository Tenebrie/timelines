import { useNavigate as useBaseNavigate } from '@tanstack/react-router'
import {
	AnyRouter,
	FromPathOption,
	NavigateOptions,
	RegisteredRouter,
	UseNavigateResult,
} from '@tanstack/router-core'

/**
 * Tanstack useNavigate wrapper to fix regression reported since v1.121.34
 * https://github.com/TanStack/router/issues/4526
 *
 * Attempting to change the search query without navigation (no `to` param) still
 * navigates to the provided `from` param, losing current path information.
 * Workaround is to provide `"."` as the `to` param. To avoid noise in app code, it
 * is provided as a default value in useStableNavigate.
 *
 * Future regressions may also be fixed through this wrapper.
 *
 * As of 1.147.3, the regression is still not fixed.
 */
export function useStableNavigate<
	TRouter extends AnyRouter = RegisteredRouter,
	TDefaultFrom extends string = string,
>(_defaultOpts?: { from?: FromPathOption<TRouter, TDefaultFrom> }): UseNavigateResult<TDefaultFrom> {
	const navigate = useBaseNavigate()

	return <
		TRouter extends AnyRouter = RegisteredRouter,
		const TFrom extends string = TDefaultFrom,
		const TTo extends string | undefined = undefined,
		const TMaskFrom extends string = TFrom,
		const TMaskTo extends string = '',
	>(
		args: NavigateOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo>,
	) => {
		return navigate({
			...args,
			to: args.to ?? '.',
		} as typeof args)
	}
}
