import { createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

export const router = createRouter({
	routeTree,
	defaultErrorComponent: ({ error }) => {
		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					height: '100vh',
					gap: 16,
					padding: 20,
				}}
			>
				<h1 style={{ color: '#e57373', margin: 0 }}>Something went wrong</h1>
				<pre
					style={{
						background: '#2a2a2a',
						padding: 16,
						borderRadius: 8,
						maxWidth: '80%',
						overflow: 'auto',
					}}
				>
					{error.message}
				</pre>
				<p style={{ color: '#888' }}>Fix the code, then click retry</p>
				<button
					onClick={() => window.location.reload()}
					style={{
						padding: '8px 16px',
						background: '#4a9c6d',
						color: 'white',
						border: 'none',
						borderRadius: 4,
						cursor: 'pointer',
					}}
				>
					Reload Page
				</button>
			</div>
		)
	},
})

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}
