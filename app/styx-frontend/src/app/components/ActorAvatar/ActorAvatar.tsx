import { Actor } from '@api/types/worldTypes'
import { SxProps } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import { useMemo } from 'react'

import { getContrastTextColor } from '@/app/utils/colors/getContrastTextColor'

type Props = {
	actor: Actor
	sx?: SxProps
}

export const ActorAvatar = ({ actor, sx }: Props) => {
	const color = useMemo(() => {
		if (actor.color) {
			return actor.color
		}
		return 'teal'
	}, [actor])

	const initials = (() => {
		const capitals = actor.name.replace(/[^A-Z]+/g, '')
		if (capitals.length >= 2) {
			return capitals.substring(0, 2)
		}
		return actor.name.substring(0, 2)
	})()

	return <Avatar sx={{ ...sx, color: getContrastTextColor(color), bgcolor: color }}>{initials}</Avatar>
}
