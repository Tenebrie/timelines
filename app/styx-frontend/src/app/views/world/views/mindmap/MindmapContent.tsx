import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

export function MindmapContent() {
	const { actors } = useSelector(getWorldState, (a, b) => a.actors === b.actors)

	return (
		<div>
			{actors.map((actor) => (
				<div key={actor.id}>{actor.name}</div>
			))}
		</div>
	)
}
