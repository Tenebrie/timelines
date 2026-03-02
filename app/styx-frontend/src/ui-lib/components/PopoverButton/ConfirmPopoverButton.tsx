import DeleteIcon from '@mui/icons-material/DeleteOutline'
import TimelapseIcon from '@mui/icons-material/Timelapse'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

import { PopoverButton } from './PopoverButton'

type Props = {
	type: 'expire' | 'delete'
	prompt: ReactNode
	tooltip: string
	disabled?: boolean
	onConfirm: () => void | boolean | Promise<void | boolean>
}

export function ConfirmPopoverButton({ type, prompt, tooltip, disabled, onConfirm }: Props) {
	const icon = type === 'delete' ? <DeleteIcon fontSize="small" /> : <TimelapseIcon fontSize="small" />

	return (
		<PopoverButton
			tooltip={tooltip}
			size="small"
			icon={icon}
			popoverSx={{ gap: 1.5, p: 2, maxWidth: 280 }}
			popoverBody={() => <Typography variant="body2">{prompt}</Typography>}
			popoverAction={({ close }) => (
				<>
					<Button size="small" onClick={close}>
						Cancel
					</Button>
					<Button
						size="small"
						variant="contained"
						color="error"
						onClick={async () => {
							const returnValue = await onConfirm()
							if (returnValue !== false) {
								close()
							}
						}}
						startIcon={icon}
						disabled={disabled}
					>
						{type === 'delete' ? 'Delete' : 'Expire now'}
					</Button>
				</>
			)}
		/>
	)
}
