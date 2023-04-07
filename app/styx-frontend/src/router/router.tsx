import { createBrowserRouter } from 'react-router-dom'

import App from '../App'
import { Limbo } from '../app/features/auth/limbo/Limbo'
import { Login } from '../app/features/auth/login/Login'
import { Register } from '../app/features/auth/register/Register'
import { Spinny } from '../app/features/demo/spinny/Spinny'
import { Home } from '../app/features/home/Home'
import { EventEditor } from '../app/features/world/components/EventEditor/EventEditor'
import { Outliner } from '../app/features/world/components/Outliner/Outliner'
import { StatementEditor } from '../app/features/world/components/StatementEditor/StatementEditor'
import { WorldEmptyState } from '../app/features/world/components/WorldEmptyState/WorldEmptyState'
import { appRoutes, worldRoutes } from '../app/features/world/router'
import { World } from '../app/features/world/World'

export const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: '/',
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
						element: <WorldEmptyState />,
					},
					{
						path: worldRoutes.outliner,
						element: <Outliner />,
					},
					{
						path: worldRoutes.eventEditor,
						element: <EventEditor />,
					},
					{
						path: worldRoutes.statementEditor,
						element: <StatementEditor />,
					},
				],
			},
			{
				path: '/spinny',
				element: <Spinny />,
			},
		],
	},
])
