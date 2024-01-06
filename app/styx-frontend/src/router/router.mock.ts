import { Params } from 'react-router-dom'

import { AllRouteParamMapping, routes } from './routes/routes'

export const MockedRouter = {
	isEnabled: false as boolean,
	navigations: [] as { target: string; path: string; query: [string, string][] }[],
	useParams: () => ({} as Readonly<Params<string>>),
}

export const mockRouter = <PathT extends (typeof routes)[keyof typeof routes]>(
	path: PathT,
	params: AllRouteParamMapping[PathT]
) => {
	MockedRouter.isEnabled = true
	MockedRouter.useParams = () => ({ ...params })
}

export const resetMockRouter = () => {
	MockedRouter.navigations = []
}
