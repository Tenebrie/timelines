import { Collapse, Divider, List } from '@mui/material'
import React from 'react'
import { useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { OverlayingLabel } from '../../../../../../components/OverlayingLabel'
import { getOutlinerPreferences } from '../../../../../preferences/selectors'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { getWorldState } from '../../../../selectors'
import { Actor } from '../../../../types'
import { StatementsUnit } from '../../../EventEditor/styles'
import { EventRenderer } from '../../../Renderers/EventRenderer'
import { StatementRenderer } from '../../../Renderers/StatementRenderer'
import { StatementsScroller } from '../../styles'

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
			timeLabel: timeToLabel(event.timestamp),
			collapsed: collapsedEvents.includes(event.id),
			issuedStatements: event.issuedStatements.filter(
				(statement) =>
					statement.targetActors.some((a) => a.id === actor.id) ||
					statement.mentionedActors.some((a) => a.id === actor.id)
			),
		}))
		.filter((event) => event.issuedStatements.length > 0)

	return (
		<StatementsUnit>
			<OverlayingLabel>Related events</OverlayingLabel>
			<StatementsScroller>
				{visibleEvents.map((event) => (
					<React.Fragment key={event.id}>
						<EventRenderer
							key={event.id}
							event={event}
							highlighted={false}
							secondary={event.timeLabel}
							collapsed={event.collapsed}
						/>
						<List dense component="div" disablePadding>
							<TransitionGroup>
								{!event.collapsed &&
									event.issuedStatements.map((statement, index) => (
										<Collapse key={statement.id}>
											<StatementRenderer
												statement={statement}
												active={true}
												owningActor={null}
												index={index}
											/>
										</Collapse>
									))}
							</TransitionGroup>
						</List>
						<Divider />
					</React.Fragment>
				))}
			</StatementsScroller>
		</StatementsUnit>
	)
}
