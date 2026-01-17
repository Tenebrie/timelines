import { Icon } from '@iconify/react'
import Box from '@mui/material/Box'

type Props = {
	name: string
	height: number
}

export const EventIcon = ({ name, height }: Props) => {
	return (
		<Box
			sx={{
				width: height,
				height: height,
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Icon ssr icon={name === 'default' ? 'mdi:leaf' : name} width={height} height={height} />
		</Box>
	)
}
