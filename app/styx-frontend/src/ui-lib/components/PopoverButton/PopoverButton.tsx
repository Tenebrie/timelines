import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { ReactNode } from 'react'

type Props = {
	icon: ReactNode
	tooltip: string
	color: Parameters<typeof IconButton>['0']['color']
	size: 'small' | 'medium' | 'large'
	popoverBody: (props: { close: () => void }) => ReactNode
	popoverAction: (props: { close: () => void }) => ReactNode
	buttonSx?: Parameters<typeof IconButton>['0']['sx']
	popoverSx?: Parameters<typeof Stack>['0']['sx']
	autofocus?: boolean
	onCleanup?: () => void
	rippleVariant?: 'icon' | 'button'
	popoverAlign?: Parameters<typeof Popover>['0']['anchorOrigin']
}

export function PopoverButton({
	icon,
	tooltip,
	size,
	color,
	popoverBody,
	popoverAction,
	buttonSx,
	popoverSx,
	autofocus,
	onCleanup,
	rippleVariant = 'icon',
	popoverAlign = { vertical: 'bottom', horizontal: 'right' },
}: Props) {
	const popupState = usePopupState({ variant: 'popover', popupId: tooltip })

	const popoverActionResult = popoverAction({ close: popupState.close })

	const sharedButtonProps = {
		'aria-label': tooltip,
		...bindTrigger(popupState),
		onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
		onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
			e.preventDefault()
			e.stopPropagation()
			onCleanup?.()
			bindTrigger(popupState).onClick(e)
		},
	}

	return (
		<>
			<Tooltip title={tooltip} disableInteractive enterDelay={500}>
				{rippleVariant === 'button' ? (
					<Button
						color={color === 'default' ? undefined : color}
						{...sharedButtonProps}
						sx={{ minWidth: 0, padding: 0, ...buttonSx }}
					>
						{icon}
					</Button>
				) : (
					<IconButton
						color={color}
						size={size}
						sx={{ opacity: 0.7, '&:hover': { opacity: 1 }, ...buttonSx }}
						{...sharedButtonProps}
					>
						{icon}
					</IconButton>
				)}
			</Tooltip>
			<Popover
				{...bindPopover(popupState)}
				anchorOrigin={popoverAlign}
				transformOrigin={{ horizontal: popoverAlign.horizontal, vertical: 'top' }}
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
				<Stack sx={{ ...popoverSx, gap: 2 }}>
					{popoverBody({ close: popupState.close })}
					{popoverActionResult && (
						<Stack direction="row" spacing={1} justifyContent="flex-end">
							{popoverActionResult}
						</Stack>
					)}
				</Stack>
			</Popover>
		</>
	)
}
