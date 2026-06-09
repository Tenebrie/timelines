import Box from '@mui/material/Box'

import { useEntityColor } from '@/app/utils/colors/useEntityColor'

type Props = {
	id: string
	color: string
	height: number
}

export function CustomEntityColor({ id, color, height }: Props) {
	const entityColor = useEntityColor({ id, color })
	return (
		<Box
			sx={{
				backgroundColor: entityColor,
				width: height ?? 'unset',
				height: height ?? 'unset',
				borderRadius: 0.3,
				marginRight: 1,
			}}
		/>
	)
}
