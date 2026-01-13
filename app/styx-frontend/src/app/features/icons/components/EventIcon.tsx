import { Icon } from '@iconify/react'
import { useTheme } from '@mui/material/styles'

import { useEventIcons } from '../hooks/useEventIcons'

type Props = {
	name: string
	height: number
}

export const EventIcon = ({ name, height }: Props) => {
	const theme = useTheme()
	const { getIconPath } = useEventIcons()

	return (
		<Icon icon={name === 'default' ? 'mdi:leaf' : name} width={height} height={height} />
		// <img
		// 	style={{ filter: theme.palette.mode === 'light' ? 'invert()' : '' }}
		// 	src={getIconPath(name)}
		// 	alt={`${name} icon`}
		// 	height={typeof height === 'number' ? `${height}px` : height}
		// />
	)
}
