import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactNode, useEffect, useState } from 'react'
import useEvent from 'react-use-event-hook'

import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

type Props = {
	value: string
	onSave?: (value: string) => void
	startAdornment?: ReactNode
}

export const EditableTitle = ({ value, onSave, startAdornment }: Props) => {
	const [editing, setEditing] = useState(false)
	const [currentTitle, setCurrentTitle] = useState(value)

	const applyChanges = useEvent(() => {
		setEditing(false)
		if (currentTitle === value || !currentTitle?.trim()) {
			return
		}
		if (onSave) {
			onSave(currentTitle)
		}
	})

	useShortcut([Shortcut.Enter, Shortcut.CtrlEnter], applyChanges, editing)
	useShortcut(
		[Shortcut.Escape],
		() => {
			setEditing(false)
			setCurrentTitle(value)
		},
		editing,
	)

	useEffect(() => {
		setEditing(false)
	}, [value])

	const onStartEdit = useEvent(() => {
		setEditing(true)
		setCurrentTitle(value)
	})

	return (
		<Stack
			gap={1}
			direction="row"
			alignItems="center"
			justifyContent="center"
			width="100%"
			sx={{ height: '32px' }}
		>
			{startAdornment}
			{startAdornment && <Divider orientation="vertical" sx={{ height: 24 }} />}
			{!editing && (
				<Stack direction="row" justifyContent="space-between" width="100%">
					<Button
						variant="text"
						sx={{ padding: '0 8px', width: '100%', justifyContent: 'flex-start' }}
						onClick={onStartEdit}
					>
						<Typography variant="h6" noWrap>
							{value}
						</Typography>
					</Button>
				</Stack>
			)}
			{editing && (
				<Input
					autoFocus
					value={currentTitle}
					onChange={(event) => setCurrentTitle(event.target.value)}
					onBlur={() => applyChanges()}
					role="textbox"
					sx={{
						width: '100%',
						marginBottom: '-7px',
						fontSize: '20px',
						fontWeight: 450,
						paddingLeft: '8px',
						paddingBottom: '6px',
					}}
				/>
			)}
		</Stack>
	)
}
