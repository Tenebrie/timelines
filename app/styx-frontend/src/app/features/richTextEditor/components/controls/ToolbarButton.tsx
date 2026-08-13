import Tooltip from '@mui/material/Tooltip'
import { ComponentProps, ReactNode } from 'react'
import styled from 'styled-components'

import { ActiveButtonIndicator } from '@/app/features/richTextEditor/extensions/mentions/components/ActiveButtonIndicator'
import { Button } from '@/ui-lib/components/Button/Button'

type Props = {
	tooltip: string
	onClick: () => void
	active?: boolean
	sx?: ComponentProps<typeof Button>['sx']
	children: ReactNode
}

export function ToolbarButton({ tooltip, onClick, active, sx, children }: Props) {
	return (
		<Tooltip title={tooltip} disableInteractive enterDelay={500}>
			<StyledSmallButton onClick={onClick} color="secondary" sx={sx}>
				{children}
				{active !== undefined && <ActiveButtonIndicator active={active} />}
			</StyledSmallButton>
		</Tooltip>
	)
}

const StyledSmallButton = styled(Button)`
	min-height: 44px !important;
	min-width: 40px !important;
	padding: 0;
	font-family: 'Roboto Mono' !important;
`
