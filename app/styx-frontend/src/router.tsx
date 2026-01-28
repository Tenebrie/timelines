import { createRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { routeTree } from './routeTree.gen'

export const router = createRouter({
	routeTree,
	defaultErrorComponent: ({ error, reset }) => {
		return <DefaultErrorComponent error={error} reset={reset} />
	},
})

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
	useEffect(() => {
		const callback = () => {
			reset()
		}

		if (import.meta.hot) {
			import.meta.hot.on('vite:afterUpdate', callback)
		}
		return () => {
			import.meta.hot?.off('vite:afterUpdate', callback)
		}
	}, [reset])

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				gap: 16,
				padding: 20,
				background: '#1a1a1a',
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
					color: '#fff',
				}}
			>
				{error.message}
			</pre>
			<div style={{ display: 'flex', gap: 12 }}>
				<button
					onClick={() => {
						reset()
					}}
					style={{
						padding: '8px 16px',
						background: '#4a9c6d',
						color: 'white',
						border: 'none',
						borderRadius: 4,
						cursor: 'pointer',
						fontSize: 14,
					}}
				>
					Reset
				</button>
			</div>
		</div>
	)
}

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}
