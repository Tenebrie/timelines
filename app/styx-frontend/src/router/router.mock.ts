import { Params, useSearchParams } from 'react-router-dom'

import { allQueries, AllRouteParamMapping, routes } from './routes/routes'

export const MockedRouter = {
	isEnabled: false as boolean,
	navigations: [] as { target: string; path: string; query: [string, string][] }[],
	useParams: () => ({} as Readonly<Params<string>>),
	useSearchParams: () => {
		return {
			query: new URLSearchParams(),
			setQuery: (_: URLSearchParams) => {
				/* */
			},
		}
	},
}

export const mockRouter = <PathT extends (typeof routes)[keyof typeof routes]>(
	_: PathT,
	params: AllRouteParamMapping[PathT],
	query?: (typeof allQueries)[PathT]
) => {
	MockedRouter.isEnabled = true
	MockedRouter.useParams = () => ({ ...params })

	let mockQueryState = new URLSearchParams(query)
	MockedRouter.useSearchParams = () => {
		const setter = (val: URLSearchParams) => {
			mockQueryState = new URLSearchParams(val)
		}
		return {
			query: mockQueryState,
			setQuery: setter,
		}
	}
}

export const resetMockRouter = () => {
	MockedRouter.navigations = []
}

export const useMockedRouter = (
	params: Readonly<Params<string>>,
	[currentQuery, setCurrentQuery]: [URLSearchParams, ReturnType<typeof useSearchParams>[1]]
) => {
	const mockParams = MockedRouter.useParams()
	const { query: mockQuery, setQuery: setMockQuery } = MockedRouter.useSearchParams()

	if (MockedRouter.isEnabled) {
		return { params: mockParams, currentQuery: mockQuery, setCurrentQuery: setMockQuery }
	}

	return { params, currentQuery, setCurrentQuery }
}
