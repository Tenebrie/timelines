import DeleteIcon from '@mui/icons-material/DeleteOutline'
import TimelapseIcon from '@mui/icons-material/Timelapse'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

import { PopoverButton, PopoverButtonProps } from './PopoverButton'

type Props = Omit<PopoverButtonProps, 'content' | 'popoverBody' | 'popoverAction'> & {
	type: 'expire' | 'delete'
	prompt: ReactNode
	tooltip: string
	loading?: boolean
	disabled?: boolean
	confirmDisabled?: boolean
	onConfirm: () => void | boolean | Promise<void | boolean>
}

export function ConfirmPopoverButton(props: Props) {
	const { type, prompt, loading, confirmDisabled, onConfirm, popoverSx } = props
	const icon = type === 'delete' ? <DeleteIcon fontSize="small" /> : <TimelapseIcon fontSize="small" />

	return (
		<PopoverButton
			{...props}
			size="small"
			content={icon}
			onEnterKey={async ({ close }) => {
				await onConfirm()
				close()
			}}
			popoverSx={{ gap: 1.5, p: 2, maxWidth: 280, ...popoverSx }}
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
