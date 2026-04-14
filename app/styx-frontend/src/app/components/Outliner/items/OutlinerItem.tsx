import { ActorDetails, WorldEvent, WorldTag } from '@api/types/worldTypes'
import { memo } from 'react'

import { OutlinerItemActor } from './OutlinerItemActor'
import { OutlinerItemEvent } from './OutlinerItemEvent'
import { OutlinerItemHeader } from './OutlinerItemHeader'
import { OutlinerItemTag } from './OutlinerItemTag'

type Props = {
	index: number
	actor?: ActorDetails
	event?: WorldEvent
	tag?: WorldTag
}

export const OutlinerItem = memo(OutlinerItemComponent)

function OutlinerItemComponent({ index, actor, event, tag }: Props) {
	if (index === 0) {
		return <OutlinerItemHeader />
	}
	if (actor) {
		return <OutlinerItemActor actor={actor} />
	} else if (event) {
		return <OutlinerItemEvent event={event} />
	} else if (tag) {
		return <OutlinerItemTag tag={tag} />
	}
	return <div>&nbsp;</div>
}
