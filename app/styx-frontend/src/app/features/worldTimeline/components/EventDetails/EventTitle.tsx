import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'

import { useModal } from '@/app/features/modals/reducer'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut'

import { EventDraft } from '../EventEditor/components/EventDetailsEditor/useEventFields'

type Props = {
	draft: EventDraft
}

export const EventTitle = ({ draft }: Props) => {
	const [editing, setEditing] = useState(false)
	const [name, setName] = useState(draft.name)

	const applyChanges = () => {
		setEditing(false)
		draft.setName(name.trim())
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
		setName(draft.name)
	}, [draft.name])

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
					<Button
						variant="text"
						sx={{ padding: '0 8px', flexGrow: 1, justifyContent: 'flex-start' }}
						onClick={() => setEditing(true)}
					>
						<Typography variant="h6" noWrap>
							{draft.name || 'Create event'}
						</Typography>
					</Button>
					<Button
						sx={{ padding: '4px 12px', textWrap: 'nowrap', flexShrink: 0 }}
						onClick={openTimeTravelModal}
					>
						{timeLabel}
					</Button>
				</Stack>
			)}
			{editing && (
				<Input
					autoFocus
					value={name}
					onChange={(event) => setName(event.target.value)}
					onBlur={() => applyChanges()}
					placeholder="Create event"
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
