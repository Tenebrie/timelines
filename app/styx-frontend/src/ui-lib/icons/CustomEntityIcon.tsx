import { Icon } from '@iconify/react'
import Stack from '@mui/material/Stack'

import { useEntityColor } from '@/app/utils/colors/useEntityColor'

type Props = {
	id: string
	icon?: string
	color: string
	height: number
}

export function CustomEntityIcon({ id, icon, color, height }: Props) {
	const entityColor = useEntityColor({ id, color })
	return (
		<Stack direction="row" alignItems="center" justifyContent="center">
			<Icon
				icon={icon === 'default' ? 'mdi:event' : (icon ?? 'mdi:event')}
				color={entityColor}
				style={{
					width: height ?? 'unset',
					height: height ?? 'unset',
				}}
			/>
		</Stack>
	)
}
