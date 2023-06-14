import React from 'react'
import { useSelector } from 'react-redux'

import { OverlayingLabel } from '../../../../../../components/OverlayingLabel'
import { getOutlinerPreferences } from '../../../../../preferences/selectors'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { getWorldState } from '../../../../selectors'
import { Actor } from '../../../../types'
import { StatementsUnit } from '../../../EventEditor/styles'
import { EventWithStatementsRenderer } from '../../../Renderers/EventWithStatementsRenderer'
import { StatementsScroller } from '../../styles'
import { ActorEventsEmptyState } from './ActorEventsEmptyState'

type Props = {
	actor: Actor
}

export const ActorEvents = ({ actor }: Props) => {
	const { events } = useSelector(getWorldState)
	const { timeToLabel } = useWorldTime()
	const { collapsedEvents } = useSelector(getOutlinerPreferences)

	const visibleEvents = events
		.map((event) => ({
			...event,
			secondary: timeToLabel(event.timestamp),
			highlighted: false,
			collapsed: collapsedEvents.includes(event.id),
			issuedStatements: event.issuedStatements
				.filter(
					(statement) =>
						statement.targetActors.some((a) => a.id === actor.id) ||
						statement.mentionedActors.some((a) => a.id === actor.id)
				)
				.map((statement) => ({
					...statement,
					active: true,
				})),
		}))
		.filter((event) => event.issuedStatements.length > 0)

	return (
		<StatementsUnit>
			<OverlayingLabel>Related events</OverlayingLabel>
			<StatementsScroller>
				{visibleEvents.map((event, index) => (
					<EventWithStatementsRenderer
						key={event.id}
						{...event}
						event={event}
						divider={index !== visibleEvents.length - 1}
					/>
				))}
				{visibleEvents.length === 0 && <ActorEventsEmptyState />}
			</StatementsScroller>
		</StatementsUnit>
	)
}
