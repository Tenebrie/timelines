import { createBrowserRouter } from 'react-router-dom'

import App from '../App'
import { Login } from '../app/features/auth/login/Login'
import { Register } from '../app/features/auth/register/Register'
import { Home } from '../app/features/home/Home'
import { Limbo } from '../app/features/limbo/Limbo'
import { Spinny } from '../app/features/spinny/Spinny'
import { EventEditor } from '../app/features/world/components/EventEditor/EventEditor'
import { OutlinerEmptyState } from '../app/features/world/components/Outliner/components/OutlinerEmptyState/OutlinerEmptyState'
import { Outliner } from '../app/features/world/components/Outliner/Outliner'
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
						element: <OutlinerEmptyState />,
					},
					{
						path: worldRoutes.outliner,
						element: <Outliner />,
					},
					{
						path: worldRoutes.eventEditor,
						element: <EventEditor />,
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
