import { createBrowserRouter } from 'react-router-dom'

import { ErrorBoundary } from './error/ErrorBoundary'
import { appRoutes } from './routes/appRoutes'
import { homeRoutes } from './routes/featureRoutes/homeRoutes'
import { worldRoutes } from './routes/featureRoutes/worldRoutes'
import { worldTimelineRoutes } from './routes/featureRoutes/worldTimelineRoutes'
import { worldWikiRoutes } from './routes/featureRoutes/worldWikiRoutes'
import { routes } from './routes/routes'

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
		errorElement: <ErrorBoundary />,
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
						...lazyImport(import('../app/features/worldSettings/WorldSettings').then((m) => m.WorldDetails)),
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
						path: worldRoutes.timeline,
						...lazyImport(import('../app/features/worldTimeline/WorldTimeline').then((m) => m.WorldTimeline)),
						children: [
							{
								path: worldTimelineRoutes.root,
								...lazyImport(
									import('../app/features/worldTimeline/components/Outliner/Outliner').then(
										(m) => m.Outliner,
									),
								),
							},
							{
								path: worldTimelineRoutes.outliner,
								...lazyImport(
									import('../app/features/worldTimeline/components/Outliner/Outliner').then(
										(m) => m.Outliner,
									),
								),
							},
							{
								path: worldTimelineRoutes.actorEditor,
								...lazyImport(
									import('../app/features/worldTimeline/components/ActorEditor/ActorEditor').then(
										(m) => m.ActorEditor,
									),
								),
							},
							{
								path: worldTimelineRoutes.eventCreator,
								...lazyImport(
									import('../app/features/worldTimeline/components/EventEditor/EventCreatorWrapper').then(
										(m) => m.EventCreatorWrapper,
									),
								),
							},
							{
								path: worldTimelineRoutes.eventEditor,
								...lazyImport(
									import('../app/features/worldTimeline/components/EventEditor/EventEditor').then(
										(m) => m.EventEditor,
									),
								),
							},
							{
								path: worldTimelineRoutes.eventDeltaCreator,
								...lazyImport(
									import(
										'../app/features/worldTimeline/components/EventEditor/EventDeltaEditor/EventDeltaCreator'
									).then((m) => m.EventDeltaCreator),
								),
							},
							{
								path: worldTimelineRoutes.eventDeltaEditor,
								...lazyImport(
									import(
										'../app/features/worldTimeline/components/EventEditor/EventDeltaEditor/EventDeltaEditor'
									).then((m) => m.EventDeltaEditor),
								),
							},
						],
					},
					{
						path: worldRoutes.overview,
						...lazyImport(import('../app/features/worldOverview/WorldOverview').then((m) => m.WorldOverview)),
					},
					{
						path: worldRoutes.wiki,
						...lazyImport(import('../app/features/worldWiki/WorldWiki').then((m) => m.WorldWiki)),
						children: [
							{
								path: worldWikiRoutes.article,
								...lazyImport(
									import('../app/features/worldWiki/components/ArticleDetails/ArticleDetails').then(
										(m) => m.ArticleDetails,
									),
								),
							},
						],
					},
					{
						path: worldRoutes.actors,
						...lazyImport(import('../app/features/worldActors/WorldActors').then((m) => m.WorldActors)),
					},
					{
						path: worldRoutes.settings,
						...lazyImport(import('../app/features/worldSettings/WorldSettings').then((m) => m.WorldDetails)),
					},
				],
			},
			{
				path: routes.adminRoot,
				...lazyImport(import('../app/features/admin/Admin').then((m) => m.Admin)),
			},
			{
				path: '/spinny',
				...lazyImport(import('../app/features/demo/spinny/Spinny').then((m) => m.Spinny)),
			},
			{
				path: '/music',
				...lazyImport(import('../app/features/demo/music/Music').then((m) => m.Music)),
			},
		],
	},
]

export const router = createBrowserRouter(routerDefinition)
