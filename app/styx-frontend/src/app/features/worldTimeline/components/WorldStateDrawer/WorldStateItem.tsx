import { memo } from 'react'

import { ActorDetails, WorldEvent } from '../../types'
import { WorldStateActor } from './WorldStateItem/WorldStateActor'
import { WorldStateEvent } from './WorldStateItem/WorldStateEvent'
import { WorldStateHeader } from './WorldStateItem/WorldStateHeader'

type Props = {
	index: number
	actor?: ActorDetails
	event?: WorldEvent
}

export const WorldStateItem = memo(WorldStateItemComponent)

function WorldStateItemComponent({ index, actor, event }: Props) {
	if (index === 0) {
		return <WorldStateHeader />
	}
	if (actor) {
		return <WorldStateActor actor={actor} />
	} else if (event) {
		return <WorldStateEvent event={event} />
	}
	return <div>Error element (shouldn't render)</div>
}
