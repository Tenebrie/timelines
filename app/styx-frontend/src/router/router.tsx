import { createBrowserRouter } from 'react-router-dom'

import App from '../App'
import { Login } from '../app/features/login/Login'
import { EventEditor } from '../app/features/world/components/EventEditor/EventEditor'
import { OutlinerEmptyState } from '../app/features/world/components/Outliner/components/OutlinerEmptyState/OutlinerEmptyState'
import { Outliner } from '../app/features/world/components/Outliner/Outliner'
import { worldRoutes } from '../app/features/world/router'
import { World } from '../app/features/world/World'

export const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: '/',
				element: <World />,
				children: [
					{
						path: '/',
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
				path: '/login',
				element: <Login />,
			},
		],
	},
])
