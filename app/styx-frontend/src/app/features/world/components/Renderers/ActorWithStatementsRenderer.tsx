import { Collapse, Divider, List } from '@mui/material'
import { TransitionGroup } from 'react-transition-group'

import { ActorDetails, WorldEvent } from '../../types'
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

export const ActorWithStatementsRenderer = ({ actor, highlighted, collapsed, divider }: Props) => {
	return (
		<>
			<ActorRenderer actor={actor} collapsed={collapsed} highlighted={highlighted} />
			<List dense component="div" disablePadding>
				<TransitionGroup>
					{!collapsed &&
						actor.events.map((event, index) => (
							<Collapse key={event.id}>
								<EventRenderer
									event={event}
									owningActor={actor}
									index={index}
									highlighted={false}
									collapsed={false}
									short={false}
								/>
							</Collapse>
						))}
					{!collapsed && actor.statements.length === 0 && (
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
