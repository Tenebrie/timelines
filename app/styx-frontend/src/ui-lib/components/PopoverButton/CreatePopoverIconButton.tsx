import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'

import { PopoverButton, PopoverButtonProps } from './PopoverButton'

type Props = Omit<PopoverButtonProps, 'content' | 'popoverAction'> & {
	onConfirm: () => void | boolean | Promise<void | boolean>
	confirmDisabled?: boolean
}

export function CreatePopoverIconButton(props: Props) {
	const { onConfirm, confirmDisabled, size = 'medium', popoverSx, buttonSx } = props
	const icon = <AddIcon fontSize={size} />

	return (
		<PopoverButton
			{...props}
			content={icon}
			buttonSx={{
				opacity: 1,
				bgcolor: 'action.hover',
				'&:hover': {
					opacity: 1,
					bgcolor: 'action.selected',
				},
				...buttonSx,
			}}
			popoverSx={{ gap: 1.5, p: 2, ...popoverSx }}
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
					startIcon={icon}
				>
					Create
				</Button>
			)}
		/>
	)
}
