import { createBrowserRouter } from 'react-router-dom'

import { appRoutes } from './routes/appRoutes'
import { homeRoutes } from './routes/homeRoutes'
import { worldRoutes } from './routes/worldRoutes'

const lazyImport = (component: Promise<() => JSX.Element>) => {
	return {
		lazy: async () => {
			const comp = await component
			return {
				Component: comp,
			}
		},
	}
}

export const routerDefinition: Parameters<typeof createBrowserRouter>[0] = [
	{
		path: '/',
		...lazyImport(import('../App').then((m) => m.default)),
		children: [
			{
				path: appRoutes.limbo,
				...lazyImport(import('../app/features/auth/limbo/Limbo').then((m) => m.Limbo)),
			},
			{
				path: appRoutes.home,
				...lazyImport(import('../app/features/home/Home').then((m) => m.Home)),
				children: [
					{
						path: homeRoutes.worldDetails,
						...lazyImport(
							import('../app/features/worldList/components/WorldDetails/WorldDetails').then(
								(m) => m.WorldDetails
							)
						),
					},
				],
			},
			{
				path: appRoutes.login,
				...lazyImport(import('../app/features/auth/login/Login').then((m) => m.Login)),
			},
			{
				path: appRoutes.register,
				...lazyImport(import('../app/features/auth/register/Register').then((m) => m.Register)),
			},
			{
				path: worldRoutes.root,
				...lazyImport(import('../app/features/world/World').then((m) => m.World)),
				children: [
					{
						path: worldRoutes.root,
						...lazyImport(
							import('../app/features/world/components/Outliner/Outliner').then((m) => m.Outliner)
						),
					},
					{
						path: worldRoutes.outliner,
						...lazyImport(
							import('../app/features/world/components/Outliner/Outliner').then((m) => m.Outliner)
						),
					},
					{
						path: worldRoutes.actorEditor,
						...lazyImport(
							import('../app/features/world/components/ActorEditor/ActorEditor').then((m) => m.ActorEditor)
						),
					},
					{
						path: worldRoutes.eventCreator,
						...lazyImport(
							import('../app/features/world/components/EventEditor/EventCreator').then((m) => m.EventCreator)
						),
					},
					{
						path: worldRoutes.eventEditor,
						...lazyImport(
							import('../app/features/world/components/EventEditor/EventEditor').then((m) => m.EventEditor)
						),
					},
					{
						path: worldRoutes.eventDeltaCreator,
						...lazyImport(
							import('../app/features/world/components/EventEditor/EventDeltaEditor/EventDeltaCreator').then(
								(m) => m.EventDeltaCreator
							)
						),
					},
					{
						path: worldRoutes.eventDeltaEditor,
						...lazyImport(
							import('../app/features/world/components/EventEditor/EventDeltaEditor/EventDeltaEditor').then(
								(m) => m.EventDeltaEditor
							)
						),
					},
				],
			},
			{
				path: '/spinny',
				...lazyImport(import('../app/features/demo/spinny/Spinny').then((m) => m.Spinny)),
			},
		],
	},
]

export const router = createBrowserRouter(routerDefinition)
