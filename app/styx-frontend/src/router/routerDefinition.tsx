import { createBrowserRouter } from 'react-router-dom'

import App from '../App'
import { Limbo } from '../app/features/auth/limbo/Limbo'
import { Login } from '../app/features/auth/login/Login'
import { Register } from '../app/features/auth/register/Register'
import { Spinny } from '../app/features/demo/spinny/Spinny'
import { Home } from '../app/features/home/Home'
import { ActorEditor } from '../app/features/world/components/ActorEditor/ActorEditor'
import { EventCreator } from '../app/features/world/components/EventEditor/EventCreator'
import { EventDeltaCreator } from '../app/features/world/components/EventEditor/EventDeltaEditor/EventDeltaCreator'
import { EventDeltaEditor } from '../app/features/world/components/EventEditor/EventDeltaEditor/EventDeltaEditor'
import { EventEditor } from '../app/features/world/components/EventEditor/EventEditor'
import { Outliner } from '../app/features/world/components/Outliner/Outliner'
import { appRoutes, worldRoutes } from '../app/features/world/router'
import { World } from '../app/features/world/World'

export const routerDefinition: Parameters<typeof createBrowserRouter>[0] = [
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: appRoutes.limbo,
				element: <Limbo />,
			},
			{
				path: appRoutes.home,
				element: <Home />,
			},
			{
				path: appRoutes.login,
				element: <Login />,
			},
			{
				path: appRoutes.register,
				element: <Register />,
			},
			{
				path: worldRoutes.root,
				element: <World />,
				children: [
					{
						path: worldRoutes.root,
						element: <Outliner />,
					},
					{
						path: worldRoutes.outliner,
						element: <Outliner />,
					},
					{
						path: worldRoutes.actorEditor,
						element: <ActorEditor />,
					},
					{
						path: worldRoutes.eventCreator,
						element: <EventCreator />,
					},
					{
						path: worldRoutes.eventEditor,
						element: <EventEditor />,
					},
					{
						path: worldRoutes.eventDeltaCreator,
						element: <EventDeltaCreator />,
					},
					{
						path: worldRoutes.eventDeltaEditor,
						element: <EventDeltaEditor />,
					},
				],
			},
			{
				path: '/spinny',
				element: <Spinny />,
			},
		],
	},
]

export const router = createBrowserRouter(routerDefinition)
