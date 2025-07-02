import { WorldEvent } from '@api/types/worldTypes'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

import { EventColorIconPicker } from '@/app/components/ColorIconPicker/EventColorIconPicker'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

import { EventDraft } from '../draft/useEventDraft'

type Props = {
	event: WorldEvent
	draft: EventDraft
}

export const EventTitle = ({ event, draft }: Props) => {
	const [editing, setEditing] = useState(false)
	const [name, setName] = useState(draft.name)

	const navigate = useNavigate({ from: '/world/$worldId' })

	const applyChanges = () => {
		setEditing(false)
		const trimmedName = name.trim()
		draft.setName(trimmedName)
		draft.setCustomNameEnabled(trimmedName.length > 0)
	}

	useShortcut([Shortcut.Enter, Shortcut.CtrlEnter], applyChanges, editing)
	useShortcut(
		[Shortcut.Escape],
		() => {
			setEditing(false)
			setName(draft.name)
		},
		editing,
	)

	const { timeToLabel } = useWorldTime()
	const timeLabel = useMemo(() => {
		if (!draft) {
			return ''
		}
		return timeToLabel(draft.timestamp)
	}, [timeToLabel, draft])

	const { open: openTimeTravelModal } = useModal('timeTravelModal')

	useEffect(() => {
		if (draft.customNameEnabled) {
			setName(draft.name)
		} else {
			setName('')
		}
	}, [draft.customNameEnabled, draft.name])

	if (!draft) {
		return null
	}

	return (
		<Stack
			gap={1}
			direction="row"
			alignContent="center"
			width="100%"
			sx={{ height: '32px' }}
			data-testid="EventTitle"
		>
			{!editing && (
				<Stack direction="row" justifyContent="space-between" width="100%">
					<EventColorIconPicker draft={draft} />
					<Button
						variant="text"
						sx={{ padding: '0 8px', flexGrow: 1, justifyContent: 'flex-start' }}
						onClick={() => setEditing(true)}
					>
						<Typography variant="h6" noWrap>
							{name || event.name || 'Create event'}
						</Typography>
					</Button>
					<Button
						sx={{ padding: '4px 12px', textWrap: 'nowrap', flexShrink: 0 }}
						onClick={openTimeTravelModal}
					>
						{timeLabel}
					</Button>
					{/* TODO: Add close button without breaking the drawer */}
					{/* <Button
						variant="contained"
						size="small"
						onClick={() => navigate({ search: (prev) => ({ ...prev, selection: [], new: false }) })}
					>
						<Close />
					</Button> */}
				</Stack>
			)}
			{editing && (
				<Input
					autoFocus
					value={name}
					onChange={(event) => setName(event.target.value)}
					onBlur={() => applyChanges()}
					placeholder={'Custom name'}
					role="textbox"
					sx={{
						width: '100%',
						marginBottom: '-9px',
						fontSize: '20px',
						fontWeight: 450,
						paddingLeft: '8px',
						paddingBottom: '8px',
					}}
				/>
			)}
		</Stack>
	)
}
