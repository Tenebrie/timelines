import { useCallback } from 'react'
import { NavigateOptions, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { CleanUpPathParam, SplitStringBy } from '../types/utils'
import { MockedRouter, useMockedRouter } from './router.mock'
import { GenericArgsOrVoid, GenericQueryOrVoid, QueryStrategy } from './types'

export const useBaseRouter = <
	PathT extends string,
	RoutesT extends Record<string, PathT>,
	ParamsT extends {
		[K in keyof RoutesT as RoutesT[K]]: {
			[Q in CleanUpPathParam<SplitStringBy<RoutesT[K], '/'>[number]>]: string
		}
	},
	QueryT extends Record<keyof ParamsT, Record<string, string> | undefined>,
>(
	_: RoutesT,
	defaultQuery?: QueryT,
) => {
	const location = useLocation()
	const navigate = useNavigate()

	const { params: state, currentQuery, setCurrentQuery } = useMockedRouter(useParams(), useSearchParams())

	const stateOf = useCallback(<T extends keyof ParamsT>(_: T) => state as ParamsT[typeof _], [state])
	const queryOf = useCallback(
		<T extends keyof ParamsT>(route: T) => {
			if (!defaultQuery) {
				return {} as NonNullable<QueryT[T]>
			}

			const defaultValue = defaultQuery[route]
			if (!defaultValue) {
				return {} as NonNullable<QueryT[T]>
			}

			const result = {} as NonNullable<QueryT[T]>
			Object.keys(defaultValue).forEach((key) => {
				result[key] = currentQuery.get(key) ?? defaultValue[key]
			})
			return result
		},
		[currentQuery, defaultQuery],
	)

	const queryOfOrNull = useCallback(
		<T extends keyof ParamsT>(route: T) => {
			if (!defaultQuery) {
				return {} as NonNullable<{ [K in keyof QueryT[T]]: QueryT[T][K] | null }>
			}

			const defaultValue = defaultQuery[route]
			if (!defaultValue) {
				return {} as NonNullable<{ [K in keyof QueryT[T]]: QueryT[T][K] | null }>
			}

			const result = {} as NonNullable<{ [K in keyof QueryT[T]]: QueryT[T][K] | null }>
			Object.keys(defaultValue).forEach((key) => {
				// @ts-ignore
				result[key] = currentQuery.get(key) ?? null
			})
			return result
		},
		[currentQuery, defaultQuery],
	)

	const navigateTo = useCallback(
		<T extends keyof ParamsT>({
			target,
			args,
			query,
			navigateParams,
		}: GenericArgsOrVoid<ParamsT[T]> &
			GenericQueryOrVoid<QueryT[T]> & {
				target: T
				navigateParams?: NavigateOptions
			}) => {
			const pathname = (() => {
				if (!args) {
					return target as string
				}

				return Object.keys(args).reduce(
					(total, current) => total.replace(`:${current}`, args[current]),
					target as string,
				)
			})()

			const evaluatedQuery: NonNullable<QueryT[T]> = {
				...(defaultQuery?.[target] ?? ({} as NonNullable<QueryT[T]>)),
				...query,
			}

			const mappedQuery = (
				Array.from(currentQuery.entries()) as [string, string | null | undefined | QueryStrategy][]
			)
				.filter((entry) => evaluatedQuery[entry[0]] === QueryStrategy.Preserve)
				.concat(
					Object.entries(evaluatedQuery).filter(
						(q) => q[1] !== undefined && q[1] !== QueryStrategy.Clear && q[1] !== QueryStrategy.Preserve,
					),
				)
				.filter((entry) => entry[1] !== null) as [string, string][]

			const search = mappedQuery.map((entry) => `${entry[0]}=${entry[1]}`).join('&')

			if (location.pathname === pathname && location.search === `?${search}`) {
				return
			}

			navigate(
				{
					pathname,
					search,
				},
				navigateParams,
			)
			if (MockedRouter.isEnabled) {
				setCurrentQuery(new URLSearchParams(search))
				MockedRouter.navigations.push({
					target: `${pathname}${search ? '?' : ''}${search}`,
					path: pathname,
					query: mappedQuery,
				})
			}
		},
		[currentQuery, defaultQuery, location.pathname, location.search, navigate, setCurrentQuery],
	)

	const setQuery = useCallback(
		(name: string, value: string | null) => {
			if (value === null) {
				currentQuery.delete(name)
			} else {
				currentQuery.set(name, value)
			}
			setCurrentQuery(currentQuery)
		},
		[currentQuery, setCurrentQuery],
	)

	const isLocationEqual = useCallback(
		(route: keyof ParamsT) => {
			const routeSegments = (route as string).split('/')
			const locationSegments = location.pathname.split('/')
			if (routeSegments.length !== locationSegments.length) {
				return false
			}
			return routeSegments.every(
				(segment, index) => segment.startsWith(':') || locationSegments[index] === segment,
			)
		},
		[location.pathname],
	)

	const isLocationChildOf = useCallback(
		(route: keyof ParamsT) => {
			const routeSegments = (route as string).split('/')
			const locationSegments = location.pathname.split('/')
			return routeSegments.every(
				(segment, index) => segment.startsWith(':') || locationSegments[index] === segment,
			)
		},
		[location.pathname],
	)

	return {
		navigateTo,
		stateOf,
		queryOf,
		queryOfOrNull,
		setQuery,
		isLocationEqual,
		isLocationChildOf,
	}
}
