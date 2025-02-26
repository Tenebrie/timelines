import { ActorDetails, WorldEvent } from '@api/types/types'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import { memo } from 'react'
import { TransitionGroup } from 'react-transition-group'

import { ZebraWrapper } from '@/app/views/world/views/timeline/components/TimelineShelf/styles'

import { EventRenderer } from '../OutlinerItemEvent/EventRenderer'
import { ActorRenderer } from './ActorRenderer'
import { EmptyStatementListRenderer } from './EmptyStatementListRenderer'

type Props = {
	actor: ActorDetails
	collapsed: boolean
	divider: boolean
}

export const ActorWithStatementsRendererComponent = ({ actor, collapsed, divider }: Props) => {
	const events: WorldEvent[] = []
	return (
		<>
			<ActorRenderer actor={actor} collapsed={collapsed} />
			<List dense component="div" disablePadding>
				<TransitionGroup>
					{!collapsed &&
						events.map((event, index) => (
							<Collapse key={event.id}>
								<ZebraWrapper $zebra={index % 2 === 0}>
									<EventRenderer
										event={event}
										owningActor={actor}
										collapsed={false}
										short={false}
										active
										actions={[]}
									/>
								</ZebraWrapper>
							</Collapse>
						))}
					{!collapsed && events.length === 0 && (
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
