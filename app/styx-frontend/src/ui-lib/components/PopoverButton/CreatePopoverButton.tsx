import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { ReactNode } from 'react'

import { PopoverButton } from './PopoverButton'

type Props = {
	size?: 'small' | 'medium' | 'large'
	tooltip: string
	popoverBody: (props: { close: () => void }) => ReactNode
	onConfirm: () => void | boolean | Promise<void | boolean>
	confirmDisabled?: boolean
	buttonSx?: Parameters<typeof IconButton>['0']['sx']
	popoverSx?: Parameters<typeof Stack>['0']['sx']
}

export function CreatePopoverButton({
	size = 'medium',
	tooltip,
	popoverBody,
	onConfirm,
	confirmDisabled,
	buttonSx,
	popoverSx,
}: Props) {
	const icon = <AddIcon fontSize={size} />

	return (
		<PopoverButton
			tooltip={tooltip}
			size={size}
			icon={icon}
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
			popoverBody={popoverBody}
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
