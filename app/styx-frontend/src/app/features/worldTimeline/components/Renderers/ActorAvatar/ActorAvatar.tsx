import { Avatar } from '@mui/material'
import { useMemo } from 'react'

import { Actor } from '@/app/features/worldTimeline/types'

type Props = {
	actor: Actor
}

export const ActorAvatar = ({ actor }: Props) => {
	const color = useMemo(() => {
		if (actor.color) {
			return actor.color
		}
		return 'teal'
	}, [actor])

	const initials = useMemo(() => {
		const capitals = actor.name.replace(/[^A-Z]+/g, '')
		if (capitals.length >= 2) {
			return capitals.substring(0, 2)
		}
		return actor.name.substring(0, 2)
	}, [actor])

	return <Avatar sx={{ bgcolor: color }}>{initials}</Avatar>
}
