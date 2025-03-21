import { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

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
	const isWorldOpen = useCheckRouteMatch('/world/$worldId')
	const { name: worldName, description: worldDescription } = useSelector(
		getWorldState,
		(a, b) => a.name === b.name && a.description === b.description,
	)

	const update = useCallback(() => {
		const envTag = getEnvTag()
		const name = isWorldOpen ? worldName : 'Timelines'
		const title = `${envTag}${name}`
		window.document.title = title

		const description = isWorldOpen ? worldDescription : 'The app for all your writing needs.'
		document.querySelector('meta[name="description"]')?.setAttribute('content', description)
	}, [isWorldOpen, worldDescription, worldName])

	useEffect(() => {
		update()
	}, [worldName, update])
}
