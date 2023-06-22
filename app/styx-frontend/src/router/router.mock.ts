import { Params } from 'react-router-dom'

import { AllRouteParamMapping, allRoutes } from '../app/features/world/router'

export const MockedRouter = {
	isEnabled: false as boolean,
	navigations: [] as { target: string; path: string; query: [string, string][] }[],
	useParams: () => ({} as Readonly<Params<string>>),
}

export const mockRouter = <PathT extends (typeof allRoutes)[keyof typeof allRoutes]>(
	path: PathT,
	params: AllRouteParamMapping[PathT]
) => {
	MockedRouter.isEnabled = true
	MockedRouter.useParams = () => ({ ...params })
}

export const resetMockRouter = () => {
	MockedRouter.navigations = []
}
