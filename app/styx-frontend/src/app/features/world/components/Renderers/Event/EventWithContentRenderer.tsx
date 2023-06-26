import { Collapse, Divider, List } from '@mui/material'
import { TransitionGroup } from 'react-transition-group'

import { Actor, WorldEvent } from '../../../types'
import { EventContentRenderer } from './EventContentRenderer'
import { EventRenderer } from './EventRenderer'

type Props = {
	event: WorldEvent
	highlighted: boolean
	collapsed: boolean
	owningActor: Actor | null
	short: boolean
	index: number
	active: boolean
	divider: boolean
}

export const EventWithContentRenderer = ({
	event,
	highlighted,
	collapsed,
	owningActor,
	short,
	index,
	active,
	divider,
}: Props) => {
	return (
		<>
			<EventRenderer
				event={event}
				highlighted={highlighted}
				collapsed={collapsed}
				owningActor={owningActor}
				short={short}
				index={index}
			/>
			<List dense component="div" disablePadding>
				<TransitionGroup>
					{!collapsed && (
						<Collapse>
							<EventContentRenderer event={event} owningActor={owningActor} short={short} active={active} />
						</Collapse>
					)}
				</TransitionGroup>
			</List>
			{divider && <Divider />}
		</>
	)
}
