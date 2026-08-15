import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'

import { PopoverButton, PopoverButtonProps } from './PopoverButton'

type Props = Omit<PopoverButtonProps, 'content' | 'popoverAction'> & {
	onConfirm: () => void | boolean | Promise<void | boolean>
	confirmDisabled?: boolean
}
export type CreatePopoverButtonProps = Props

export function CreatePopoverButton(props: Props) {
	const { onConfirm, confirmDisabled, size = 'medium', popoverSx, buttonSx, buttonVariant } = props

	const content = buttonVariant === 'icon' ? <AddIcon fontSize={size} /> : <>Create new...</>
	const startIcon = buttonVariant === 'icon' ? undefined : <AddIcon fontSize={size} />

	return (
		<PopoverButton
			{...props}
			content={content}
			startIcon={startIcon}
			buttonVariant="contained"
			popoverSx={{ gap: 1.5, p: 2, ...popoverSx }}
			buttonSx={{
				fontSize: '0.875rem',
				...buttonSx,
			}}
			autofocus
			popoverAction={({ close }) => (
				<Button
					variant="contained"
					size={size}
					onClick={async () => {
						const returnValue = await onConfirm()
						if (returnValue !== false) {
							close()
						}
					}}
					disabled={confirmDisabled}
					fullWidth
					startIcon={<AddIcon fontSize={size} />}
				>
					Create
				</Button>
			)}
		/>
	)
}
