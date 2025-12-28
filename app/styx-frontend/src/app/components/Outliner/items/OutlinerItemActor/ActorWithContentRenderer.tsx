import { ActorDetails } from '@api/types/worldTypes'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import { memo } from 'react'

import { EventContentRenderer } from './ActorContentRenderer'
import { ActorRenderer } from './ActorRenderer'

type Props = {
	actor: ActorDetails
	collapsed: boolean
	divider: boolean
}

export const ActorWithContentRenderer = memo(ActorWithContentRendererComponent)

function ActorWithContentRendererComponent({ actor, collapsed, divider }: Props) {
	return (
		<>
			<ActorRenderer actor={actor} collapsed={collapsed} />
			<Collapse in={!collapsed}>
				<EventContentRenderer actor={actor} active />
			</Collapse>
			{divider && <Divider />}
		</>
	)
}
