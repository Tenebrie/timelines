import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import styled, { CSSProperties } from 'styled-components'

import { useEventIcons } from '@/app/features/icons/useEventIcons'
import { useCustomTheme } from '@/app/features/theming/useCustomTheme'

type Props = {
	icon: string
	color: string
	onClick: () => void
}

export const Marker = styled(Button)`
	position: relative;
	width: calc(100%);
	height: calc(100%);
	min-width: 1px !important;
	border-radius: 6px;
	cursor: pointer;
	transition:
		border-color 0.3s,
		background-color 0.3s;

	.icon {
		position: absolute;
		mask-size: cover;
		top: 1px;
		left: 1px;
		width: calc(100% - 2px);
		height: calc(100% - 2px);
		transition:
			color 0.3s,
			background-color 0.3s;
		background: var(--background);
		mask-image: var(--icon-path);
	}
`

export function ColorIconPicker({ icon, color, onClick }: Props) {
	const theme = useCustomTheme()
	const { getIconPath } = useEventIcons()

	const baseColor = color ?? '#000000'

	const cssVariables = {
		'--icon-path': `url(${getIconPath(icon)})`,
		'--background': baseColor,
	} as CSSProperties

	return (
		<Box
			sx={{
				height: 'calc(100%)',
				aspectRatio: 1,
				borderRadius: '6px',
			}}
		>
			<Marker style={cssVariables} onClick={onClick}>
				<div className="icon"></div>
			</Marker>
		</Box>
	)
}
