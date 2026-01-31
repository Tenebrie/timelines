import { UpdateCalendarUnitApiArg, useUpdateCalendarUnitMutation } from '@api/calendarApi'
import { CalendarDraftUnit } from '@api/types/calendarTypes'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import debounce from 'lodash.debounce'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { getCalendarEditorState } from '../CalendarSliceSelectors'
import { CalendarUnitPreview } from '../preview/CalendarUnitPreview'
import { AddChildForm } from './AddChildForm'
import { ChildrenList } from './ChildrenList'

type Props = {
	unit: CalendarDraftUnit
}

export function UnitEditor({ unit }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const allUnits = useMemo(() => calendar?.units ?? [], [calendar])
	const [updateUnit] = useUpdateCalendarUnitMutation()

	const [unitDraft, setUnitDraft] = useState<CalendarDraftUnit>(unit)

	useEffect(() => {
		setUnitDraft(unit)
	}, [unit])

	const onUpdateUnitThrottled = useMemo(
		() =>
			debounce(async (body: UpdateCalendarUnitApiArg['body']) => {
				const result = parseApiResponse(
					await updateUnit({
						calendarId: unit.calendarId,
						unitId: unit.id,
						body: {
							...body,
							name: body.name?.trim(),
							displayName: body.displayName === '' ? null : body.displayName?.trim(),
							displayNameShort: body.displayNameShort === '' ? null : body.displayNameShort?.trim(),
							displayNamePlural: body.displayNamePlural === '' ? null : body.displayNamePlural?.trim(),
						},
					}),
				)
				if (result.error) {
					return
				}
				setUnitDraft(result.response)
			}, 1000),
		[updateUnit, unit.calendarId, unit.id],
	)

	const onUpdateUnit = useEvent((body: UpdateCalendarUnitApiArg['body']) => {
		setUnitDraft((prev) => ({
			...prev,
			name: body.name ?? prev.name,
			displayName: body.displayName ?? prev.displayName,
			displayNameShort: body.displayNameShort ?? prev.displayNameShort,
			displayNamePlural: body.displayNamePlural ?? prev.displayNamePlural,
			dateFormatShorthand: body.dateFormatShorthand ?? prev.dateFormatShorthand,
		}))
		onUpdateUnitThrottled(body)
	})

	const availableChildren = useMemo(() => allUnits.filter((u) => u.id !== unit.id), [allUnits, unit.id])

	if (!calendar) {
		return null
	}

	return (
		<Stack gap={2} direction="row">
			<Stack gap={2} sx={{ flex: 1 }}>
				{/* Unit Details */}
				<Stack gap={2}>
					<TextField
						label="Name"
						size="small"
						value={unitDraft.name}
						onChange={(e) => onUpdateUnit({ name: e.target.value })}
						sx={{ flex: 1 }}
					/>
				</Stack>
				<Stack direction="row" gap={2}>
					<TextField
						label="Display Name"
						size="small"
						value={unitDraft.displayName ?? ''}
						onChange={(e) => onUpdateUnit({ displayName: e.target.value })}
						sx={{ flex: 1 }}
					/>
					<TextField
						label="Plural Name"
						size="small"
						value={unitDraft.displayNamePlural ?? ''}
						onChange={(e) => onUpdateUnit({ displayNamePlural: e.target.value })}
						sx={{ flex: 1 }}
					/>
					<TextField
						label="Short Name"
						size="small"
						value={unitDraft.displayNameShort ?? ''}
						onChange={(e) => onUpdateUnit({ displayNameShort: e.target.value })}
						sx={{ width: 120 }}
					/>
					<TextField
						label="Format"
						size="small"
						slotProps={{
							htmlInput: {
								maxLength: 1,
							},
						}}
						value={unitDraft.dateFormatShorthand ?? ''}
						onChange={(e) => onUpdateUnit({ dateFormatShorthand: e.target.value })}
						sx={{ width: 80 }}
					/>
				</Stack>

				<Divider />

				{/* Children Management */}
				<Box>
					<Typography variant="subtitle2" gutterBottom>
						Structure
					</Typography>

					<Stack gap={2}>
						<ChildrenList parent={unit} />

						{availableChildren.length > 0 && <AddChildForm key={unit.id} parent={unit} />}
						{availableChildren.length === 0 && (
							<Typography variant="body2" color="text.secondary">
								No other units available to add as children.
							</Typography>
						)}
					</Stack>
				</Box>

				<Divider />
			</Stack>

			{/* Tree Preview */}
			<Box sx={{ flex: 0.5 }}>
				<Typography variant="subtitle2" gutterBottom>
					Structure Preview
				</Typography>
				<CalendarUnitPreview unit={unit} />
			</Box>
		</Stack>
	)
}
