import { memo } from 'react'
import { useSelector } from 'react-redux'

import { getOutlinerPreferences } from '@/app/features/preferences/selectors'
import { ActorDetails } from '@/app/features/worldTimeline/types'

import { ActorWithStatementsRenderer } from '../../Renderers/ActorWithStatementsRenderer'

export const WorldStateActor = memo(WorldStateActorComponent)

type Props = {
	actor: ActorDetails
}

function WorldStateActorComponent({ actor }: Props) {
	const { expandedActors } = useSelector(
		getOutlinerPreferences,
		(a, b) => a.expandedActors === b.expandedActors,
	)

	return (
		<ActorWithStatementsRenderer
			collapsed={!expandedActors.includes(actor.id)}
			actor={actor}
			divider={true}
		/>
	)
}
