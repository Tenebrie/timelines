import { useCallback, useMemo } from 'react'
import { NavigateOptions, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { MockedRouter } from './router.mock'

export enum QueryStrategy {
	Clear,
	Preserve,
}

export const useBaseRouter = <ParamsT extends Record<string, Record<string, string> | undefined>>(
	routes: Record<string, keyof ParamsT>
) => {
	const location = useLocation()
	const actualParams = useParams()
	const mockParams = MockedRouter.useParams()
	const state = useMemo(
		() => (MockedRouter.isEnabled ? mockParams : actualParams),
		[actualParams, mockParams]
	)

	const navigate = useNavigate()
	const [currentQuery, setCurrentQuery] = useSearchParams()

	const navigateTo = useCallback(
		<T extends (typeof routes)[keyof typeof routes]>({
			target,
			args,
			query,
			navigateParams,
		}: {
			target: T
			args?: ParamsT[T]
			query?: Record<string, string | null | undefined | QueryStrategy>
			navigateParams?: NavigateOptions
		}) => {
			const pathname = (() => {
				if (args === undefined) {
					return target as string
				}

				return Object.keys(args).reduce(
					(total, current) => total.replace(`:${current}`, args[current]),
					target as string
				)
			})()

			const evaluatedQuery = query ?? {}

			const mappedQuery = (
				Array.from(currentQuery.entries()) as [string, string | null | undefined | QueryStrategy][]
			)
				.filter((entry) => evaluatedQuery[entry[0]] === QueryStrategy.Preserve)
				.concat(
					Object.entries(evaluatedQuery).filter(
						(q) => q[1] !== undefined && q[1] !== QueryStrategy.Clear && q[1] !== QueryStrategy.Preserve
					)
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
				navigateParams
			)
			if (MockedRouter.isEnabled) {
				MockedRouter.navigations.push({
					target: `${pathname}${search ? '?' : ''}${search}`,
					path: pathname,
					query: mappedQuery,
				})
			}
		},
		[currentQuery, location.pathname, location.search, navigate]
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
		[currentQuery, setCurrentQuery]
	)

	const isLocationEqual = useCallback(
		(route: string) => {
			const locationSegments = location.pathname.split('/')
			return route
				.split('/')
				.every((segment, index) => segment.startsWith(':') || locationSegments[index] === segment)
		},
		[location.pathname]
	)

	return {
		state,
		navigateTo,
		query: currentQuery,
		setQuery,
		isLocationEqual,
	}
}
