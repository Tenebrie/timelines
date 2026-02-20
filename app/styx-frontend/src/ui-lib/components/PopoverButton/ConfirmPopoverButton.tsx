import Delete from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

import { PopoverButton } from './PopoverButton'

type Props = {
	type: 'delete'
	prompt: ReactNode
	tooltip: string
	disabled?: boolean
	onConfirm: () => void | boolean | Promise<void | boolean>
}

export function ConfirmPopoverButton({ prompt, tooltip, disabled, onConfirm }: Props) {
	const icon = <Delete fontSize="small" />

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
						Delete
					</Button>
				</>
			)}
		/>
	)
}
