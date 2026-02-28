import { WorldEvent } from '@api/types/worldTypes'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

import { EventColorIconPicker } from '@/app/components/ColorIconPicker/EventColorIconPicker'
import { Shortcut, ShortcutPriorities, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

import { EventDraft } from '../draft/useEventDraft'
import { EventTimePopover } from './EventTimePopover'

type Props = {
	event: WorldEvent
	draft: EventDraft
}

export const EventTitle = ({ event, draft }: Props) => {
	const [editing, setEditing] = useState(false)
	const [name, setName] = useState(draft.name)

	const applyChanges = () => {
		setEditing(false)
		const trimmedName = name.trim()
		draft.setName(trimmedName)
	}

	useShortcut([Shortcut.Enter, Shortcut.CtrlEnter], applyChanges, editing)
	useShortcut(
		[Shortcut.Escape],
		() => {
			setEditing(false)
			setName(draft.name)
		},
		editing && ShortcutPriorities.InputField,
	)

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
					<EventColorIconPicker draft={draft} />
					<Button
						variant="text"
						sx={{ padding: '0 8px', flexGrow: 1, justifyContent: 'flex-start' }}
						onClick={() => setEditing(true)}
					>
						<Typography variant="h6" noWrap>
							{name || event.name || '<Unnamed>'}
						</Typography>
					</Button>
					<EventTimePopover draft={draft} />
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
