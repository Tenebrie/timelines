import { CalendarDraftPresentationUnit } from '@api/types/calendarTypes'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import debounce from 'lodash.debounce'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { ConfirmPopoverButton } from '@/ui-lib/components/PopoverButton/ConfirmPopoverButton'

import { getCalendarEditorState } from '../../CalendarSliceSelectors'

type Props = {
	layer: CalendarDraftPresentationUnit
	onSave: (value: Partial<CalendarDraftPresentationUnit>) => void
	onDelete: () => void
	index: number
}

export const CalendarPresentationUnit = memo(CalendarPresentationUnitComponent)

function CalendarPresentationUnitComponent({ layer, onSave, onDelete, index }: Props) {
	const { calendar } = useSelector(getCalendarEditorState, (a, b) => a.calendar === b.calendar)
	const backingUnit = calendar?.units.find((u) => u.id === layer.unitId) ?? null
	if (!calendar || !backingUnit) {
		throw new Error('No calendar set or invalid backing unit')
	}

	const name = backingUnit.displayName ?? backingUnit.name

	const [subdivision, setSubdivision] = useState(layer.subdivision)
	const [formatString, setFormatString] = useState(layer.formatString)

	const onSaveDebounced = useMemo(() => {
		return debounce((value: Partial<CalendarDraftPresentationUnit>) => {
			onSave(value)
		}, 300)
	}, [onSave])

	useEffect(() => {
		setSubdivision(layer.subdivision)
		setFormatString(layer.formatString)
	}, [layer.formatString, layer.subdivision])

	const handleSubdivisionChange = useCallback(
		(value: number) => {
			if (isNaN(value) || value < 1) {
				return
			}
			setSubdivision(value)
			onSaveDebounced({ subdivision: value, formatString })
		},
		[formatString, onSaveDebounced],
	)

	const handleFormatStringChange = useCallback(
		(value: string) => {
			setFormatString(value)
			onSaveDebounced({ subdivision, formatString: value })
		},
		[onSaveDebounced, subdivision],
	)

	const sizeLabel =
		index === 0 ? 'Small' : index === 1 ? 'Medium' : index === 2 ? 'Large' : `Level ${index + 1}`

	return (
		<Stack
			direction="row"
			alignItems="center"
			gap={1}
			sx={{
				p: '12px 12px',
				borderRadius: 1,
				bgcolor: 'action.hover',
			}}
		>
			<Stack>
				<Typography variant="body2" sx={{ minWidth: 100, textTransform: 'capitalize' }}>
					{name}
				</Typography>
				<Typography variant="caption">{sizeLabel} divider</Typography>
			</Stack>
			<TextField
				size="small"
				label="Step"
				type="number"
				value={subdivision}
				onChange={(e) => handleSubdivisionChange(Number(e.target.value))}
				sx={{ width: 100 }}
				slotProps={{ htmlInput: { min: 1, step: 1 } }}
			/>
			<TextField
				size="small"
				label="Format"
				value={formatString}
				onChange={(e) => {
					handleFormatStringChange(e.target.value)
				}}
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
