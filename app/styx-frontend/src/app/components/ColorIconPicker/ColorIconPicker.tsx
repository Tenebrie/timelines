import { Icon } from '@iconify/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import styled from 'styled-components'

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
	padding: 0;
	transition:
		border-color 0.3s,
		background-color 0.3s;
`

export function ColorIconPicker({ icon, color, onClick }: Props) {
	const baseColor = color ?? '#000000'

	return (
		<Box
			sx={{
				height: 'calc(100%)',
				aspectRatio: 1,
				borderRadius: '6px',
			}}
		>
			<Marker onClick={onClick}>
				<Icon
					icon={icon === 'default' ? 'mdi:leaf' : icon}
					color={baseColor}
					style={{
						position: 'absolute',
						top: '2px',
						left: '2px',
						width: 'calc(100% - 2px)',
						height: 'calc(100% - 2px)',
					}}
				/>
			</Marker>
		</Box>
	)
}
