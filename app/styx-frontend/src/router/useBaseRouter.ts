import { NavigateOptions, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { MockedRouter } from './router.mock'

export const useBaseRouter = <T extends string>(routes: Record<string, T>) => {
	const location = useLocation()
	const actualParams = useParams()
	const mockParams = MockedRouter.useParams()
	const state = MockedRouter.isEnabled ? mockParams : actualParams

	const navigate = useNavigate()
	const [currentQuery, setCurrentQuery] = useSearchParams()

	const navigateTo = (
		target: (typeof routes)[keyof typeof routes],
		args: Record<string, string>,
		query: Record<string, string | null | undefined>,
		navigateParams?: NavigateOptions
	) => {
		const pathname = Object.keys(args).reduce(
			(total, current) => total.replace(`:${current}`, args[current]),
			target
		)

		const mappedQuery = (Array.from(currentQuery.entries()) as [string, string | null | undefined][])
			.filter((entry) => query[entry[0]] === undefined)
			.concat(Object.entries(query))
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
	}

	const setQuery = (name: string, value: string | null) => {
		if (value === null) {
			currentQuery.delete(name)
		} else {
			currentQuery.set(name, value)
		}
		setCurrentQuery(currentQuery)
		// const currentEntries = Array.from(currentQuery.entries())
		// const existingEntry = currentEntries.find((entry) => entry[0] === name)
		// if (existingEntry) {
		// 	currentQuery.set(name, value)
		// 	// setCurrentQuery()
		// }
	}

	return {
		state,
		navigateTo,
		query: currentQuery,
		setQuery,
	}
}
