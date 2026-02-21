import { CalendarDraftUnit, CalendarDraftUnitChildRelation } from '@api/types/calendarTypes'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { useUpdateCalendarUnitDebounced } from '@/app/features/time/calendar/api/useUpdateCalendarUnitDebounced'
import { calendarEditorSlice } from '@/app/features/time/calendar/CalendarSlice'
import { getCalendarEditorState } from '@/app/features/time/calendar/CalendarSliceSelectors'

import { CalendarUnitChildDropHandle } from './CalendarUnitChildDropHandle'
import { CalendarUnitChildListItem } from './CalendarUnitChildListItem'

type Props = {
	parent: CalendarDraftUnit
}

export function CalendarUnitChildList({ parent }: Props) {
	const { calendar } = useSelector(getCalendarEditorState)
	const [updateUnit] = useUpdateCalendarUnitDebounced()
	const dispatch = useDispatch()
	const { updateUnitChildren } = calendarEditorSlice.actions

	const availableUnits = useMemo(() => {
		if (!calendar) {
			return []
		}
		return calendar.units.filter((u) => {
			return u.id !== parent.id
		})
	}, [calendar, parent.id])

	const onUpdateChild = useEvent((relationId: string, updates: Partial<CalendarDraftUnitChildRelation>) => {
		const newChildren = parent.children.map((c) => (c.id === relationId ? { ...c, ...updates } : c))
		updateUnit({
			calendarId: parent.calendarId,
			unitId: parent.id,
			body: {
				children: newChildren,
			},
		})
		dispatch(updateUnitChildren({ unitId: parent.id, children: newChildren }))
	})

	const onDeleteChild = useEvent((relationId: string) => {
		const newChildren = parent.children.filter((c) => c.id !== relationId)
		dispatch(updateUnitChildren({ unitId: parent.id, children: newChildren }))
		updateUnit({
			calendarId: parent.calendarId,
			unitId: parent.id,
			body: {
				children: newChildren,
			},
		})
	})

	const onReorder = useEvent((fromIndex: number, toIndex: number) => {
		if (fromIndex === toIndex) return

		const newChildren = [...parent.children]
		const [removed] = newChildren.splice(fromIndex, 1)
		const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex
		newChildren.splice(adjustedToIndex, 0, removed)

		dispatch(updateUnitChildren({ unitId: parent.id, children: newChildren }))
		updateUnit({
			calendarId: parent.calendarId,
			unitId: parent.id,
			body: {
				children: newChildren,
			},
		})
	})

	if (!calendar) {
		return null
	}

	if (parent.children.length === 0) {
		return (
			<Typography variant="body2" color="text.secondary" fontStyle="italic">
				This is a base unit with no children. Add children below to make it a composite unit.
			</Typography>
		)
	}

	return (
		<Stack gap={0}>
			<CalendarUnitChildDropHandle parentUnitId={parent.id} position={0} onReorder={onReorder} />
			{parent.children.map((child, index) => (
				<CalendarUnitChildListItem
					key={child.id}
					parentUnitId={parent.id}
					child={child}
					index={index}
					availableUnits={availableUnits}
					onUpdateChild={onUpdateChild}
					onDeleteChild={onDeleteChild}
					onReorder={onReorder}
				/>
			))}
		</Stack>
	)
}
