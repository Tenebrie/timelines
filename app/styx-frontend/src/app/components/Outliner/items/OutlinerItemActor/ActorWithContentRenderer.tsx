import { ActorDetails } from '@api/types/worldTypes'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import { memo } from 'react'

import { ActorContentRenderer } from './ActorContentRenderer'
import { ActorHeaderRenderer } from './ActorRenderer'

type Props = {
	actor: ActorDetails
	collapsed: boolean
	divider: boolean
}

export const ActorWithContentRenderer = memo(ActorWithContentRendererComponent)

function ActorWithContentRendererComponent({ actor, collapsed, divider }: Props) {
	return (
		<>
			<ActorHeaderRenderer actor={actor} collapsed={collapsed} />
			<Collapse in={!collapsed}>
				<ActorContentRenderer actor={actor} active />
			</Collapse>
			{divider && <Divider />}
		</>
	)
}
