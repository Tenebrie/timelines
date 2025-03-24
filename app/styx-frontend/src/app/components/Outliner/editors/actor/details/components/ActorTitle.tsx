import Close from '@mui/icons-material/Close'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { ActorColorIconPicker } from '@/app/components/ColorIconPicker/ActorColorIconPicker'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

import { ActorDraft } from '../draft/useActorDraft'

type Props = {
	draft: ActorDraft
}

export const ActorTitle = ({ draft }: Props) => {
	const [editing, setEditing] = useState(false)
	const [name, setName] = useState(draft.name)

	const navigate = useNavigate({ from: '/world/$worldId' })

	const applyChanges = () => {
		setEditing(false)
		const parts = name.split(',')
		const trimmedName = parts[0].trim()
		const trimmedTitle = (parts[1] ?? '').trim()
		draft.setName(trimmedName)
		draft.setTitle(trimmedTitle)
	}

	useShortcut([Shortcut.Enter, Shortcut.CtrlEnter], applyChanges, editing)
	useShortcut(
		[Shortcut.Escape],
		() => {
			setEditing(false)
			setName(draft.name)
		},
		editing ? 2 : undefined,
	)

	useEffect(() => {
		if (draft.title) {
			setName(`${draft.name}, ${draft.title}`)
		} else {
			setName(draft.name)
		}
	}, [draft.name, draft.title])

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
			data-testid="ActorTitle"
		>
			{!editing && (
				<Stack direction="row" justifyContent="space-between" width="100%">
					<ActorColorIconPicker draft={draft} />
					<Button
						variant="text"
						sx={{ padding: '0 8px', flexGrow: 1, justifyContent: 'flex-start' }}
						onClick={() => setEditing(true)}
					>
						<Typography variant="h6" noWrap>
							{name || '<Name>'}
						</Typography>
					</Button>
					<Button
						variant="text"
						onClick={() => navigate({ search: (prev) => ({ ...prev, selection: [], new: false }) })}
					>
						<Close />
					</Button>
				</Stack>
			)}
			{editing && (
				<Input
					autoFocus
					value={name}
					onChange={(event) => setName(event.target.value)}
					onBlur={() => applyChanges()}
					placeholder={'Actor name, Actor title'}
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
