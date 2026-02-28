import CalendarMonth from '@mui/icons-material/CalendarMonth'
import Public from '@mui/icons-material/Public'
import Stack from '@mui/material/Stack'

import { ListCalendarsApiResponse } from '@/api/calendarApi'
import { GetWorldsApiResponse } from '@/api/worldListApi'

import { SummaryCard } from './SummaryCard'

type SummaryCardsSectionProps = {
	ownedWorlds: GetWorldsApiResponse['ownedWorlds']
	contributableWorlds: GetWorldsApiResponse['contributableWorlds']
	calendars: ListCalendarsApiResponse | undefined
}

export function SummaryCardsSection({
	ownedWorlds,
	contributableWorlds,
	calendars,
}: SummaryCardsSectionProps) {
	return (
		<Stack
			direction={{ xs: 'column', sm: 'row' }}
			gap={3}
			sx={{
				'& > *': {
					flex: { sm: '1 1 0' },
				},
			}}
		>
			<SummaryCard
				icon={<Public />}
				title="Worlds"
				navigateTo="/world"
				items={[
					{ label: 'Owned', count: ownedWorlds.length },
					{ label: 'Contributing', count: contributableWorlds.length },
				]}
			/>
			<SummaryCard
				icon={<CalendarMonth />}
				title="Calendars"
				navigateTo="/calendar"
				items={[{ label: 'Total', count: calendars?.length ?? 0 }]}
			/>
		</Stack>
	)
}
