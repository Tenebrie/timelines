import { Collapse, Divider, List } from '@mui/material'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { getOutlinerPreferences } from '../../../../preferences/selectors'
import { Actor, WorldEvent } from '../../../types'
import { EventContentRenderer } from './EventContentRenderer'
import { EventRenderer } from './EventRenderer'

type Props = {
	event: WorldEvent
	owningActor: Actor | null
	short: boolean
	active: boolean
	divider: boolean
	actions: ('edit' | 'collapse')[]
}

export const EventWithContentRenderer = ({ event, owningActor, short, active, divider, actions }: Props) => {
	const { collapsedEvents } = useSelector(getOutlinerPreferences)
	const collapsed = useMemo(() => collapsedEvents.includes(event.id), [collapsedEvents, event])

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
