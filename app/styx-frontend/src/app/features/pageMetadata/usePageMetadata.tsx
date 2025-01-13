import { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useWorldRouter, worldRoutes } from '@/router/routes/worldRoutes'

import { getWorldState } from '../worldTimeline/selectors'

if (process.env.NODE_ENV === 'development') {
	window.document.title = 'Timelines (Dev)'
} else if (window.location.hostname === 'staging.tenebrie.com') {
	window.document.title = 'Timelines (Staging)'
}

const getEnvTag = () => {
	if (process.env.NODE_ENV === 'development') {
		return 'Dev: '
	} else if (window.location.hostname === 'staging.tenebrie.com') {
		return 'Staging: '
	}
	return ''
}

export const usePageMetadata = () => {
	const router = useWorldRouter()
	const { name: worldName, description: worldDescription } = useSelector(
		getWorldState,
		(a, b) => a.name === b.name && a.description === b.description,
	)

	const update = useCallback(() => {
		const envTag = getEnvTag()
		const isWorldOpen = router.isLocationChildOf(worldRoutes.root)
		const name = isWorldOpen ? worldName : 'Timelines'
		const title = `${envTag}${name}`
		window.document.title = title

		const description = isWorldOpen ? worldDescription : 'The app for all your writing needs.'
		document.querySelector('meta[name="description"]')?.setAttribute('content', description)
	}, [router, worldDescription, worldName])

	useEffect(() => {
		update()
	}, [worldName, update])
}
