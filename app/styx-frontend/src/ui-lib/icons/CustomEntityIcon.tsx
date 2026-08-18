import { Icon } from '@iconify/react'
import Stack from '@mui/material/Stack'

type Props = {
	icon?: string
	color: string
	height: number
}

export function CustomEntityIcon({ icon, color, height }: Props) {
	return (
		<Stack
			direction="row"
			alignItems="center"
			justifyContent="center"
			sx={{
				width: height ?? 'unset',
				height: height ?? 'unset',
			}}
		>
			<Icon
				icon={icon === 'default' ? 'mdi:event' : (icon ?? 'mdi:event')}
				color={color}
				ssr
				style={{
					width: height ?? 'unset',
					height: height ?? 'unset',
				}}
			/>
		</Stack>
	)
}
