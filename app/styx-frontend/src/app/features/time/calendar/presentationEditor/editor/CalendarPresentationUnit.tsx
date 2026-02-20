import { CalendarDraftPresentationUnit } from '@api/types/calendarTypes'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useState } from 'react'

import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { useDebouncedState } from '@/app/hooks/useDebouncedState'
import { ConfirmPopoverButton } from '@/ui-lib/components/PopoverButton/ConfirmPopoverButton'

type Props = {
	layer: CalendarDraftPresentationUnit
	onFormatStringChange: (value: string) => void
	onSubdivisionChange: (value: number) => void
	onDelete: () => void
	index: number
}

export function CalendarPresentationUnit({
	layer,
	onFormatStringChange,
	onSubdivisionChange,
	onDelete,
	index,
}: Props) {
	const { getBackingUnitOrThrow } = useWorldTime()

	const backingUnit = getBackingUnitOrThrow(layer.unitId)
	const name = backingUnit.displayName ?? backingUnit.name

	const [formatString, setFormatString] = useState(layer.formatString)

	const saveSubdivision = useCallback(
		(value: number) => {
			if (isNaN(value) || value < 1) {
				return
			}
			onSubdivisionChange(value)
		},
		[onSubdivisionChange],
	)

	const [, subdivision, setSubdivision, setSubdivisionInstant] = useDebouncedState({
		initialValue: layer.subdivision,
		onDebounce: saveSubdivision,
	})

	useEffect(() => {
		setFormatString(layer.formatString)
	}, [layer.formatString])

	const handleSubdivisionChange = useCallback(
		(value: number) => {
			if (isNaN(value) || value < 1) {
				setSubdivisionInstant(layer.subdivision)
				return
			}
			setSubdivision(value)
		},
		[layer.subdivision, setSubdivision, setSubdivisionInstant],
	)

	const sizeLabel =
		index === 0 ? 'Small' : index === 1 ? 'Medium' : index === 2 ? 'Large' : `Level ${index + 1}`

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
