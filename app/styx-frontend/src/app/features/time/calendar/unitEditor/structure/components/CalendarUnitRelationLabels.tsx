import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRef, useState } from 'react'
import useEvent from 'react-use-event-hook'

import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

type Props = {
	label: string | null | undefined
	shortLabel: string | null | undefined
	onChange: (label: string | null, shortLabel: string | null) => void
}

export function CalendarUnitRelationLabels({ label, shortLabel, onChange }: Props) {
	const [editing, setEditing] = useState(false)
	const [editLabel, setEditLabel] = useState(label ?? '')
	const [editShortLabel, setEditShortLabel] = useState(shortLabel ?? '')
	const containerRef = useRef<HTMLDivElement>(null)

	const handleStartEdit = useEvent(() => {
		setEditLabel(label ?? '')
		setEditShortLabel(shortLabel ?? '')
		setEditing(true)
	})

	const applyChanges = useEvent(() => {
		setEditing(false)
		onChange(editLabel || null, editShortLabel || null)
	})

	const cancelEdit = useEvent(() => {
		setEditing(false)
		setEditLabel(label ?? '')
		setEditShortLabel(shortLabel ?? '')
	})

	const handleBlur = useEvent((e: React.FocusEvent) => {
		// Don't close if focus is moving to another input within this container
		if (containerRef.current?.contains(e.relatedTarget as Node)) {
			return
		}
		applyChanges()
	})

	useShortcut([Shortcut.Enter, Shortcut.CtrlEnter], applyChanges, editing)
	useShortcut([Shortcut.Escape], cancelEdit, editing)

	const hasLabels = label || shortLabel
	const displayText = hasLabels ? (shortLabel ? `${label ?? ''} (${shortLabel})` : label) : null

	if (editing) {
		return (
			<Stack
				ref={containerRef}
				direction="row"
				gap={0.5}
				sx={{ flex: 1, marginTop: '4px', marginLeft: '8px' }}
			>
				<Input
					autoFocus
					size="small"
					placeholder="Label (e.g. January)"
					value={editLabel}
					onChange={(e) => setEditLabel(e.target.value)}
					onBlur={handleBlur}
					sx={{ fontSize: '0.875rem', minWidth: 120 }}
				/>
				<Input
					size="small"
					placeholder="Short (e.g. Jan)"
					value={editShortLabel}
					onChange={(e) => setEditShortLabel(e.target.value)}
					onBlur={handleBlur}
					sx={{ fontSize: '0.875rem', minWidth: 100 }}
				/>
			</Stack>
		)
	}

	return (
		<Box sx={{ flex: 1, height: '100%' }}>
			<Button
				variant="text"
				sx={{ padding: '10px 8px', justifyContent: 'flex-start', height: 1 }}
				onClick={handleStartEdit}
			>
				<Typography
					variant="body2"
					noWrap
					color={hasLabels ? 'text.secondary' : 'text.disabled'}
					sx={{ fontStyle: hasLabels ? 'normal' : 'italic' }}
				>
					{displayText ?? 'No labels'}
				</Typography>
			</Button>
		</Box>
	)
}
