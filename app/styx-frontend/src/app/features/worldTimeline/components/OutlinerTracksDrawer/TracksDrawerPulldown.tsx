import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

type Props = {
	onClick: () => void
	visible: boolean
}

export const TracksDrawerPulldown = ({ onClick, visible }: Props) => {
	return (
		<Stack direction="row" justifyContent="flex-end" sx={{ pointerEvents: 'none' }}>
			<Button
				data-testid="TracksDrawerPulldown"
				color="secondary"
				sx={{
					pointerEvents: visible ? 'auto' : 'none',
					minWidth: 100,
					maxWidth: '100px',
					background: 'rgba(0, 0, 0, 50%)',
					borderRadius: '0 0 16px 16px',
					'&:hover': {
						background: 'rgba(0, 0, 0, 70%)',
					},
				}}
				onClick={onClick}
			>
				Tracks
			</Button>
		</Stack>
	)
}
