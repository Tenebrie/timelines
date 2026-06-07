import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { ReactNode } from 'react'

import { PopoverButton, PopoverButtonSlotProps } from './PopoverButton'

type Props = {
	size?: 'small' | 'medium' | 'large'
	tooltip: string
	popoverBody: (props: { close: () => void }) => ReactNode
	onConfirm: () => void | boolean | Promise<void | boolean>
	onEnterKey?: (props: { close: () => void }) => void
	onCleanup?: () => void
	confirmDisabled?: boolean
	buttonSx?: Parameters<typeof IconButton>['0']['sx']
	popoverSx?: Parameters<typeof Stack>['0']['sx']
	slotProps?: PopoverButtonSlotProps
}

export function CreatePopoverButton({
	size = 'medium',
	tooltip,
	popoverBody,
	onEnterKey,
	onConfirm,
	onCleanup,
	confirmDisabled,
	buttonSx,
	popoverSx,
	slotProps,
}: Props) {
	return (
		<PopoverButton
			tooltip={tooltip}
			size={size}
			content={<>Create new...</>}
			startIcon={<AddIcon fontSize={size} />}
			buttonVariant="contained"
			onEnterKey={onEnterKey}
			onCleanup={onCleanup}
			popoverSx={{ gap: 1.5, p: 2, ...popoverSx }}
			popoverBody={popoverBody}
			buttonSx={{
				fontSize: '0.875rem',
				...buttonSx,
			}}
			autofocus
			slotProps={slotProps}
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
