import { useSelector } from 'react-redux'

import { getWorldState } from '../world/selectors'

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
