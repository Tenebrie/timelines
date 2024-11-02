import { Stack } from '@mui/material'
import { ReactNode } from 'react'

type Props = {
	children: ReactNode | ReactNode[]
}

export const TimelineTrackWrapper = ({ children }: Props) => {
	return (
		<Stack
			direction="row"
			width="100%"
			alignItems="center"
			sx={{ position: 'relative', height: 96, pointerEvents: 'none' }}
		>
			{children}
		</Stack>
	)
}
