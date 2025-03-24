import { ActorDetails } from '@api/types/worldTypes'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import { getOutlinerPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'

import { ActorWithContentRenderer } from './OutlinerItemActor/ActorWithContentRenderer'

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
		<ActorWithContentRenderer collapsed={!expandedActors.includes(actor.id)} actor={actor} divider={true} />
	)
}
