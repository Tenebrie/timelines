import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { ReactNode } from 'react'

type Props = {
	icon: ReactNode
	tooltip: string
	size: 'small' | 'medium' | 'large'
	popoverBody: (props: { close: () => void }) => ReactNode
	popoverAction: (props: { close: () => void }) => ReactNode
	buttonSx?: Parameters<typeof IconButton>['0']['sx']
	popoverSx?: Parameters<typeof Stack>['0']['sx']
	autofocus?: boolean
}

export function PopoverButton({
	icon,
	tooltip,
	size,
	popoverBody,
	popoverAction,
	buttonSx,
	popoverSx = { gap: 1.5, p: 2 },
	autofocus,
}: Props) {
	const popupState = usePopupState({ variant: 'popover', popupId: tooltip })

	return (
		<>
			<Tooltip title={tooltip} disableInteractive enterDelay={500}>
				<IconButton
					aria-label={tooltip}
					size={size}
					sx={{ opacity: 0.7, '&:hover': { opacity: 1 }, ...buttonSx }}
					{...bindTrigger(popupState)}
					onMouseDown={(e) => e.stopPropagation()}
					onClick={(e) => {
						e.preventDefault()
						e.stopPropagation()
						bindTrigger(popupState).onClick(e)
					}}
				>
					{icon}
				</IconButton>
			</Tooltip>
			<Popover
				{...bindPopover(popupState)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				onMouseDown={(e) => e.stopPropagation()}
				onClick={(e) => e.stopPropagation()}
				aria-label={`${tooltip} popover`}
				slotProps={{
					paper: {
						sx: {
							willChange: 'transform',
						},
						onAnimationEnd: (e) => {
							if (!autofocus || e.animationName !== 'mui-auto-fill-cancel') {
								return
							}
							const input = e.currentTarget.querySelector('input')
							input?.focus()
						},
					},
				}}
			>
				<Stack sx={{ ...popoverSx }}>
					{popoverBody({ close: popupState.close })}
					<Stack direction="row" spacing={1} justifyContent="flex-end">
						{popoverAction({ close: popupState.close })}
					</Stack>
				</Stack>
			</Popover>
		</>
	)
}
