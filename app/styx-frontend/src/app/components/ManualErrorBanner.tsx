import Close from '@mui/icons-material/Close'
import Alert, { AlertColor } from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'

type Props = {
	marginBottom?: number
	open: boolean
	error: string
	onClose?: () => void
	severity?: AlertColor
}

export const ManualErrorBanner = ({ open, marginBottom, onClose, error, severity = 'error' }: Props) => {
	return (
		<Collapse in={open}>
			<Alert
				sx={{
					marginBottom: marginBottom ?? '16px',
					'& > .MuiAlert-action': { paddingTop: 0 },
				}}
				severity={severity}
				action={
					onClose && (
						<IconButton size="small" onClick={onClose}>
							<Close fontSize="small" />
						</IconButton>
					)
				}
			>
				{error}
			</Alert>
		</Collapse>
	)
}
