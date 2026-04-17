import { MindmapWire, MindmapWireDirection } from '@api/types/mindmapTypes'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import SwapHoriz from '@mui/icons-material/SwapHoriz'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect } from 'react'

import { useEntityResolver } from '../../../modals/editEventModal/hooks/useEntityResolver'

export type MindmapWireState = {
	currentWire: MindmapWire
	label: string
	direction: MindmapWireDirection
	setLabel: (label: string) => void
	setDirection: (direction: MindmapWireDirection) => void
}

const DIRECTIONS: MindmapWireDirection[] = ['Reversed', 'TwoWay', 'Normal']
const THUMB_POSITIONS = [2, 32, 62] // px offsets for left/center/right

const SwitchTrack = styled('div')(({ theme }) => ({
	position: 'relative',
	width: 88,
	height: 28,
	background: theme.palette.action.hover,
	borderRadius: 14,
	cursor: 'pointer',
	flexShrink: 0,
	outline: 'none',
	transition: 'background 120ms ease',
	'&:hover': {
		background: theme.palette.action.selected,
	},
	'&:focus-visible': {
		boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
	},
}))

const SwitchThumb = styled('div')(({ theme }) => ({
	position: 'absolute',
	top: 2,
	width: 24,
	height: 24,
	background: theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.grey[800],
	borderRadius: '50%',
	transition: 'left 180ms cubic-bezier(0.4, 0, 0.2, 1)',
	pointerEvents: 'none',
}))

const GlyphSlot = styled('div', {
	shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean; offset: number }>(({ theme, active, offset }) => ({
	position: 'absolute',
	top: 2,
	left: offset,
	width: 24,
	height: 24,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	pointerEvents: 'none',
	color: active
		? theme.palette.mode === 'dark'
			? theme.palette.grey[900]
			: theme.palette.grey[50]
		: theme.palette.text.secondary,
	transition: 'color 180ms ease',
	zIndex: active ? 2 : 0,
	'& svg': {
		fontSize: 16,
	},
}))

const IconWrap = styled('div', {
	shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: 20,
	height: 20,
	color: active
		? theme.palette.mode === 'dark'
			? theme.palette.grey[900]
			: theme.palette.grey[50]
		: theme.palette.text.secondary,
	transition: 'color 180ms ease',
	zIndex: active ? 2 : 0,
	'& svg': {
		fontSize: 16,
	},
}))

type DirectionSwitchProps = {
	value: MindmapWireDirection
	onChange: (value: MindmapWireDirection) => void
}

function DirectionSwitch({ value, onChange }: DirectionSwitchProps) {
	const idx = DIRECTIONS.indexOf(value)

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const x = e.clientX - rect.left
		const next = x < 29 ? 0 : x < 59 ? 1 : 2
		onChange(DIRECTIONS[next])
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'ArrowLeft' && idx > 0) {
			e.preventDefault()
			onChange(DIRECTIONS[idx - 1])
		}
		if (e.key === 'ArrowRight' && idx < 2) {
			e.preventDefault()
			onChange(DIRECTIONS[idx + 1])
		}
	}

	return (
		<SwitchTrack
			role="radiogroup"
			aria-label="Link direction"
			tabIndex={0}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
		>
			<SwitchThumb style={{ left: THUMB_POSITIONS[idx] }} />
			<GlyphSlot active={idx === 0} offset={THUMB_POSITIONS[0]} aria-label="one-way left">
				<ArrowBack fontSize="inherit" />
			</GlyphSlot>
			<GlyphSlot active={idx === 1} offset={THUMB_POSITIONS[1]} aria-label="bidirectional">
				<SwapHoriz fontSize="inherit" />
			</GlyphSlot>
			<GlyphSlot active={idx === 2} offset={THUMB_POSITIONS[2]} aria-label="one-way right">
				<ArrowForward fontSize="inherit" />
			</GlyphSlot>
		</SwitchTrack>
	)
}

export function MindmapWirePopoverEditor({
	currentWire,
	label,
	setLabel,
	direction,
	setDirection,
}: MindmapWireState) {
	const { resolveEntity } = useEntityResolver()

	useEffect(() => {
		setLabel(currentWire?.content ?? '')
		setDirection(currentWire?.direction ?? 'Normal')
	}, [currentWire, setLabel, setDirection])

	const sourceActor = resolveEntity(currentWire.sourceNodeId)
	const targetActor = resolveEntity(currentWire.targetNodeId)

	if (sourceActor?.type !== 'actor' || targetActor?.type !== 'actor') {
		return null
	}

	return (
		<>
			<Box sx={{ p: '12px 12px 0 12px' }}>
				<TextField
					label="Label"
					size="small"
					variant="outlined"
					fullWidth
					value={label}
					onChange={(e) => setLabel(e.target.value)}
				/>
			</Box>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={{ px: 2, py: 1.5, gap: 1.5 }}
			>
				<Typography
					variant="body2"
					sx={{
						flex: 1,
						textAlign: 'right',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					{sourceActor.entity.name}
				</Typography>
				<DirectionSwitch value={direction} onChange={setDirection} />
				<Typography
					variant="body2"
					sx={{
						flex: 1,
						textAlign: 'left',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					{targetActor.entity.name}
				</Typography>
			</Stack>
		</>
	)
}
