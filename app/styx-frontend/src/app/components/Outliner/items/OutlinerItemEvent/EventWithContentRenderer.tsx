import { Actor, WorldEvent } from '@api/types/worldTypes'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import { memo } from 'react'
import { TransitionGroup } from 'react-transition-group'

import { EventContentRenderer } from './EventContentRenderer'
import { EventRenderer } from './EventRenderer'

type Props = {
	event: WorldEvent
	owningActor: Actor | null
	short: boolean
	active: boolean
	divider: boolean
	collapsed: boolean
	actions: readonly ('edit' | 'delete' | 'collapse')[]
}

export const EventWithContentRenderer = memo(EventWithContentRendererComponent)

function EventWithContentRendererComponent({
	event,
	owningActor,
	short,
	active,
	divider,
	collapsed,
	actions,
}: Props) {
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
