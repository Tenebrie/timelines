import { styled } from '@mui/material/styles'
import { ReactNode } from 'react'

const THUMB_SIZE = 24
const PADDING = 2
const SLOT_WIDTH = THUMB_SIZE + PADDING * 2 // 30px per slot

function getTrackWidth(count: number) {
	return SLOT_WIDTH * count + PADDING * 2 - 4
}

function getThumbOffset(index: number) {
	return PADDING + index * SLOT_WIDTH
}

const SwitchTrack = styled('div')(({ theme }) => ({
	position: 'relative',
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

type Props<T extends string | number> = {
	value: T
	positions: {
		value: T
		label?: string
		icon?: ReactNode
	}[]
	onChange: (value: T) => void
	ariaLabel?: string
}

export function MultiSwitch<T extends string | number>({ value, positions, onChange, ariaLabel }: Props<T>) {
	const count = positions.length
	const idx = positions.findIndex((p) => p.value === value)
	const trackWidth = getTrackWidth(count)

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const x = e.clientX - rect.left
		const next = Math.max(0, Math.min(count - 1, Math.floor((x / trackWidth) * count)))
		onChange(positions[next].value)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'ArrowLeft' && idx > 0) {
			e.preventDefault()
			onChange(positions[idx - 1].value)
		}
		if (e.key === 'ArrowRight' && idx < count - 1) {
			e.preventDefault()
			onChange(positions[idx + 1].value)
		}
	}

	return (
		<SwitchTrack
			role="radiogroup"
			aria-label={ariaLabel}
			tabIndex={0}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			style={{ width: trackWidth }}
		>
			<SwitchThumb style={{ left: getThumbOffset(idx) }} />
			{positions.map((pos, index) => (
				<GlyphSlot
					key={pos.value}
					active={idx === index}
					offset={getThumbOffset(index)}
					aria-label={pos.label}
				>
					{pos.icon}
				</GlyphSlot>
			))}
		</SwitchTrack>
	)
}
