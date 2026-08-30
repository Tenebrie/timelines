import MuiTooltip, { TooltipProps } from '@mui/material/Tooltip'

export type { TooltipProps }

export function Tooltip({ children, ...props }: TooltipProps) {
	return (
		<MuiTooltip
			describeChild
			disableInteractive
			enterDelay={500}
			slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -8] } }] } }}
			{...props}
		>
			<span>{children}</span>
		</MuiTooltip>
	)
}

export default Tooltip
