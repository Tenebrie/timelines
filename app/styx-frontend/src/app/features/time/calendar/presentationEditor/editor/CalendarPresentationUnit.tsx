import { CalendarDraftPresentationUnit } from '@api/types/calendarTypes'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

import { ConfirmPopoverButton } from '@/ui-lib/components/PopoverButton/ConfirmPopoverButton'

type Props = {
	layer: CalendarDraftPresentationUnit
	onFormatStringChange: (value: string) => void
	onDelete: () => void
}

export function CalendarPresentationUnit({ layer, onFormatStringChange, onDelete }: Props) {
	const name = layer.unit.displayName ?? layer.unit.name

	const [formatString, setFormatString] = useState(layer.formatString)

	useEffect(() => {
		setFormatString(layer.formatString)
	}, [layer.formatString])

	return (
		<Stack
			key={layer.unitId}
			direction="row"
			alignItems="center"
			gap={1}
			sx={{
				p: '12px 12px',
				borderRadius: 1,
				bgcolor: 'action.hover',
			}}
		>
			<Typography variant="body2" sx={{ minWidth: 100, textTransform: 'capitalize' }}>
				{name}
			</Typography>
			<TextField
				size="small"
				label="Format"
				value={formatString}
				onChange={(e) => {
					setFormatString(e.target.value)
				}}
				onBlur={() => onFormatStringChange(formatString)}
				sx={{ flex: 1 }}
			/>
			<ConfirmPopoverButton
				type="delete"
				tooltip="Remove from presentation"
				prompt={
					<>
						Are you sure you want to remove <b>{name}</b> from this presentation?
					</>
				}
				onConfirm={onDelete}
			/>
		</Stack>
	)
}
