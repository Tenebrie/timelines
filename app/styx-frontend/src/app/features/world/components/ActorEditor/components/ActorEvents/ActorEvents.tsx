import React from 'react'
import { useSelector } from 'react-redux'

import { OverlayingLabel } from '../../../../../../components/OverlayingLabel'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { useWorldRouter } from '../../../../router'
import { getWorldState } from '../../../../selectors'
import { Actor } from '../../../../types'
import { EventWithContentRenderer } from '../../../Renderers/Event/EventWithContentRenderer'
import { StatementsScroller, StatementsUnit } from '../../styles'
import { ActorEventsEmptyState } from './ActorEventsEmptyState'

type Props = {
	actor: Actor
}

export const ActorEvents = ({ actor }: Props) => {
	const { events } = useSelector(getWorldState)
	const { timeToLabel } = useWorldTime()

	const { selectedTime } = useWorldRouter()

	const visibleEvents = events
		.filter((event) => event.targetActors.some((targetActor) => targetActor.id === actor.id))
		.map((event) => ({
			...event,
			secondary: timeToLabel(event.timestamp),
			active: event.revokedAt === undefined || event.revokedAt > selectedTime,
		}))

	return (
		<StatementsUnit>
			<OverlayingLabel>Related events</OverlayingLabel>
			<StatementsScroller>
				{visibleEvents.map((event) => (
					<EventWithContentRenderer
						key={event.id}
						{...event}
						event={event}
						owningActor={actor}
						short
						divider
						actions={['collapse']}
					/>
				))}
				{visibleEvents.length === 0 && <ActorEventsEmptyState />}
			</StatementsScroller>
		</StatementsUnit>
	)
}
