import { SxProps } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import { useMemo } from 'react'

import { Actor } from '@/api/types/worldTypes'
import { getContrastTextColor } from '@/app/utils/colors/getContrastTextColor'
import { useColorUtils } from '@/app/utils/colors/useColorUtils'

type Props = {
	actor: Actor
	sx?: SxProps
	fontSize?: number | string
	surroundingColor?: string
}

export const ActorAvatar = ({ actor, sx, fontSize, surroundingColor }: Props) => {
	const { adaptColor } = useColorUtils()
	const color = useMemo(() => {
		if (!actor.color) {
			return '#000000'
		}
		if (!surroundingColor) {
			return actor.color
		}

		return adaptColor(actor.color, surroundingColor)
	}, [actor.color, adaptColor, surroundingColor])

	const initials = (() => {
		const capitals = actor.name.replace(/[^A-Z]+/g, '')
		if (capitals.length >= 2) {
			return capitals.substring(0, 2)
		}
		return actor.name.substring(0, 2)
	})()

	return (
		<Avatar sx={{ ...sx, color: getContrastTextColor(color), bgcolor: color }} style={{ fontSize }}>
			{initials}
		</Avatar>
	)
}
