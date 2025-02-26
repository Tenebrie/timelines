import { ActorDetails } from '@api/types/types'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import { getOutlinerPreferences } from '@/app/features/preferences/selectors'

import { ActorWithStatementsRenderer } from './OutlinerItemActor/ActorWithStatementsRenderer'

export const OutlinerItemActor = memo(OutlinerItemActorComponent)

type Props = {
	actor: ActorDetails
}

function OutlinerItemActorComponent({ actor }: Props) {
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
