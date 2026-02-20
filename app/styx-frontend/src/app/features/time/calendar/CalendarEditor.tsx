import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { EmptyState } from '@/app/features/time/calendar/components/EmptyState'
import { CalendarUnitEditor } from '@/app/features/time/calendar/unitEditor/CalendarUnitEditor'
import { CalendarUnitList } from '@/app/features/time/calendar/unitList/CalendarUnitList'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { getCalendarEditorState } from './CalendarSliceSelectors'
import { CalendarHeader } from './header/CalendarHeader'
import { useCalendarEditorTab } from './hooks/useCalendarEditorTab'
import { CalendarInfoEditor } from './infoEditor/CalendarInfoEditor'
import { CalendarIntervalsEditor } from './intervalsEditor/CalendarIntervalsEditor'
import { CalendarPresentationEditor } from './presentationEditor/CalendarPresentationEditor'
import { CalendarEditorTab } from './types'

export type { CalendarChangeRequest } from './types'

export function CalendarEditor() {
	const navigate = useStableNavigate({ from: '/calendar/$calendarId' })

	const onExit = useEvent(() => {
		navigate({ to: '/calendar' })
	})

	const [tab, setTab] = useCalendarEditorTab()

	return (
		<Stack sx={{ padding: '16px 16px', minHeight: 'calc(100% - 32px)' }}>
			<CalendarHeader onExit={onExit} />
			<Tabs sx={{ width: '100%' }} value={tab} onChange={(_, newValue) => setTab(newValue)}>
				<Tab label="Calendar" sx={{ flex: 1, maxWidth: 'unset', margin: 0 }} />
				<Tab label="Time Units" sx={{ flex: 1, maxWidth: 'unset', margin: 0 }} />
				<Tab label="Presentation" sx={{ flex: 1, maxWidth: 'unset', margin: 0 }} />
				{/* <Tab label="Intervals" sx={{ flex: 1, maxWidth: 'unset', margin: 0 }} /> */}
			</Tabs>
			<Divider />
			{tab === CalendarEditorTab.Info && <CalendarInfoEditor />}
			{tab === CalendarEditorTab.Units && <CalendarEditorUnitsTab />}
			{tab === CalendarEditorTab.Presentation && <CalendarPresentationEditor />}
			{tab === CalendarEditorTab.Intervals && <CalendarIntervalsEditor />}
		</Stack>
	)
}

function CalendarEditorUnitsTab() {
	const { calendar } = useSelector(getCalendarEditorState)
	const { unit: selectedUnitId } = useSearch({ from: '/calendar/$calendarId' })
	const selectedUnit = useMemo(
		() => calendar?.units.find((u) => u.id === selectedUnitId) ?? null,
		[calendar, selectedUnitId],
	)

	const navigate = useStableNavigate({ from: '/calendar/$calendarId' })
	const onSelectUnit = useEvent((unitId: string | undefined) => {
		navigate({ search: (prev) => ({ ...prev, unit: unitId }) })
	})

	return (
		<Stack direction="row" sx={{ flex: 1, alignItems: 'stretch' }}>
			<CalendarUnitList selectedUnit={selectedUnit} onSelectUnit={onSelectUnit} />
			<Stack sx={{ flex: 1 }}>
				<Stack sx={{ p: '8px' }}>
					<Paper variant="outlined" sx={{ p: '12px 8px' }}>
						{selectedUnit ? (
							<CalendarUnitEditor unit={selectedUnit} onClose={() => onSelectUnit(undefined)} />
						) : (
							<EmptyState hasUnits={(calendar?.units.length ?? 0) > 0} />
						)}
					</Paper>
				</Stack>
			</Stack>
		</Stack>
	)
}
