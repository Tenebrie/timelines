import React from 'react'
import { useSelector } from 'react-redux'

import { OverlayingLabel } from '../../../../../../components/OverlayingLabel'
import { getOutlinerPreferences } from '../../../../../preferences/selectors'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { useWorldRouter } from '../../../../router'
import { getWorldState } from '../../../../selectors'
import { Actor } from '../../../../types'
import { StatementsUnit } from '../../../EventEditor/styles'
import { EventWithContentRenderer } from '../../../Renderers/Event/EventWithContentRenderer'
import { StatementsScroller } from '../../styles'
import { ActorEventsEmptyState } from './ActorEventsEmptyState'

type Props = {
	actor: Actor
}

export const ActorEvents = ({ actor }: Props) => {
	const { events } = useSelector(getWorldState)
	const { timeToLabel } = useWorldTime()
	const { collapsedEvents } = useSelector(getOutlinerPreferences)

	const { selectedTime } = useWorldRouter()

	const visibleEvents = events.map((event) => ({
		...event,
		secondary: timeToLabel(event.timestamp),
		highlighted: false,
		collapsed: collapsedEvents.includes(event.id),
		active: event.revokedAt === undefined || event.revokedAt > selectedTime,
	}))

	return (
		<StatementsUnit>
			<OverlayingLabel>Related events</OverlayingLabel>
			<StatementsScroller>
				{visibleEvents.map((event, index) => (
					<EventWithContentRenderer
						key={event.id}
						{...event}
						event={event}
						owningActor={actor}
						index={index}
						short
						divider={index !== visibleEvents.length - 1}
					/>
				))}
				{visibleEvents.length === 0 && <ActorEventsEmptyState />}
			</StatementsScroller>
		</StatementsUnit>
	)
}
