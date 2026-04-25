import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactNode, useEffect, useState } from 'react'
import useEvent from 'react-use-event-hook'

import { Shortcut, ShortcutPriorities, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

type Props = {
	value: string
	displayValue?: string
	onSave?: (value: string) => void
	startAdornment?: ReactNode
	endAdornment?: ReactNode
	placeholder?: string
}

export const EditableTitle = ({
	value,
	displayValue,
	onSave,
	startAdornment,
	endAdornment,
	placeholder,
}: Props) => {
	const [editing, setEditing] = useState(false)
	const [currentTitle, setCurrentTitle] = useState(value)

	const applyChanges = useEvent(() => {
		setEditing(false)
		if (currentTitle === value) {
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
		editing && ShortcutPriorities.InputField,
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
			data-testid="EditableTitle"
			direction="row"
			alignItems="center"
			justifyContent="center"
			width="100%"
			sx={{ height: '32px' }}
		>
			{startAdornment}
			{!editing && (
				<Stack direction="row" justifyContent="space-between" width="100%">
					<Button
						variant="text"
						sx={{ padding: '0 8px', width: '100%', justifyContent: 'flex-start' }}
						onClick={onStartEdit}
					>
						<Typography variant="h6" noWrap>
							{displayValue ?? value}
						</Typography>
					</Button>
					{endAdornment}
				</Stack>
			)}
			{editing && (
				<Input
					autoFocus
					value={currentTitle}
					onChange={(event) => setCurrentTitle(event.target.value)}
					onBlur={() => applyChanges()}
					placeholder={placeholder}
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
