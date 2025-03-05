import { memo } from 'react'

import { ActorDetails, WorldEvent } from '@/api/types/types'

import { OutlinerItemActor } from './OutlinerItemActor'
import { OutlinerItemEvent } from './OutlinerItemEvent'
import { OutlinerItemHeader } from './OutlinerItemHeader'

type Props = {
	index: number
	actor?: ActorDetails
	event?: WorldEvent
}

export const OutlinerItem = memo(OutlinerItemComponent)

function OutlinerItemComponent({ index, actor, event }: Props) {
	if (index === 0) {
		return <OutlinerItemHeader />
	}
	if (actor) {
		return <OutlinerItemActor actor={actor} />
	} else if (event) {
		return <OutlinerItemEvent event={event} />
	}
	return <div>Error element (shouldn't render)</div>
}
