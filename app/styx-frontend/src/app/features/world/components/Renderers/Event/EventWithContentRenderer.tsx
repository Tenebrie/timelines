import { Collapse, Divider, List } from '@mui/material'
import { memo } from 'react'
import { TransitionGroup } from 'react-transition-group'

import { Actor, WorldEvent } from '@/app/features/world/types'

import { EventContentRenderer } from './EventContentRenderer'
import { EventRenderer } from './EventRenderer'

type Props = {
	event: WorldEvent
	owningActor: Actor | null
	short: boolean
	active: boolean
	divider: boolean
	collapsed: boolean
	actions: ('edit' | 'collapse')[]
}

export const EventWithContentRendererComponent = ({
	event,
	owningActor,
	short,
	active,
	divider,
	collapsed,
	actions,
}: Props) => {
	return (
		<>
			<EventRenderer
				event={event}
				collapsed={collapsed}
				owningActor={owningActor}
				short={short}
				active={active}
				actions={actions}
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

export const EventWithContentRenderer = memo(EventWithContentRendererComponent)
