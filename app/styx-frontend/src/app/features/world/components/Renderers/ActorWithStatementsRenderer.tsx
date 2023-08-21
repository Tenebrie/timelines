import { Collapse, Divider, List } from '@mui/material'
import { memo } from 'react'
import { TransitionGroup } from 'react-transition-group'

import { ActorDetails, WorldEvent } from '../../types'
import { ZebraWrapper } from '../Outliner/styles'
import { ActorRenderer } from './ActorRenderer'
import { EmptyStatementListRenderer } from './EmptyStatementListRenderer'
import { EventRenderer } from './Event/EventRenderer'

type Props = {
	actor: Omit<ActorDetails, 'events'> & {
		events: (WorldEvent & { active: boolean })[]
	}
	highlighted: boolean
	collapsed: boolean
	divider: boolean
}

export const ActorWithStatementsRendererComponent = ({ actor, highlighted, collapsed, divider }: Props) => {
	return (
		<>
			<ActorRenderer actor={actor} collapsed={collapsed} highlighted={highlighted} />
			<List dense component="div" disablePadding>
				<TransitionGroup>
					{!collapsed &&
						actor.events.map((event, index) => (
							<Collapse key={event.id}>
								<ZebraWrapper zebra={index % 2 === 0}>
									<EventRenderer
										event={event}
										owningActor={actor}
										collapsed={false}
										short={false}
										active={event.active}
										actions={[]}
									/>
								</ZebraWrapper>
							</Collapse>
						))}
					{!collapsed && actor.events.length === 0 && (
						<Collapse>
							<EmptyStatementListRenderer />
						</Collapse>
					)}
				</TransitionGroup>
			</List>
			{divider && <Divider />}
		</>
	)
}

export const ActorWithStatementsRenderer = memo(ActorWithStatementsRendererComponent)
