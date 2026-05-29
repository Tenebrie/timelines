import MuiTooltip, { TooltipProps } from '@mui/material/Tooltip'

export type { TooltipProps }

export function Tooltip({ children, ...props }: TooltipProps) {
	return (
		<MuiTooltip {...props}>
			<span>{children}</span>
		</MuiTooltip>
	)
}

export default Tooltip
