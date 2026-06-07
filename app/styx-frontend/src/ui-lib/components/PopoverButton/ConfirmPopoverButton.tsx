import DeleteIcon from '@mui/icons-material/DeleteOutline'
import TimelapseIcon from '@mui/icons-material/Timelapse'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

import { PopoverButton, PopoverButtonSlotProps } from './PopoverButton'

type Props = {
	type: 'expire' | 'delete'
	prompt: ReactNode
	tooltip: string
	loading?: boolean
	disabled?: boolean
	confirmDisabled?: boolean
	onConfirm: () => void | boolean | Promise<void | boolean>
	slotProps?: PopoverButtonSlotProps
}

export function ConfirmPopoverButton({
	type,
	prompt,
	tooltip,
	loading,
	disabled,
	confirmDisabled,
	onConfirm,
	slotProps,
}: Props) {
	const icon = type === 'delete' ? <DeleteIcon fontSize="small" /> : <TimelapseIcon fontSize="small" />

	return (
		<PopoverButton
			tooltip={tooltip}
			size="small"
			content={icon}
			disabled={disabled}
			onEnterKey={async ({ close }) => {
				await onConfirm()
				close()
			}}
			slotProps={slotProps}
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
						loading={loading}
						disabled={confirmDisabled}
					>
						{type === 'delete' ? 'Delete' : 'Expire now'}
					</Button>
				</>
			)}
		/>
	)
}
