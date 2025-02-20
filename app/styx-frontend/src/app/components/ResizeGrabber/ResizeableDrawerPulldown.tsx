import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { memo } from 'react'

type Props = {
	label: string
	width: number
	visible: boolean
	onClick: () => void
}

export const ResizeableDrawerPulldown = memo(ResizeableDrawerPulldownComponent)

function ResizeableDrawerPulldownComponent({ label, width, visible, onClick }: Props) {
	return (
		<Stack direction="row" justifyContent="flex-end" sx={{ pointerEvents: 'none' }}>
			<Button
				color="secondary"
				sx={{
					pointerEvents: visible ? 'auto' : 'none',
					minWidth: width,
					maxWidth: '100px',
					background: 'rgba(0, 0, 0, 50%)',
					borderRadius: '0 0 16px 16px',
					'&:hover': {
						background: 'rgba(0, 0, 0, 70%)',
					},
				}}
				onClick={onClick}
			>
				{label}
			</Button>
		</Stack>
	)
}
