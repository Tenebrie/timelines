import CalendarMonth from '@mui/icons-material/CalendarMonth'
import Public from '@mui/icons-material/Public'
import Stack from '@mui/material/Stack'

import { ListCalendarsApiResponse } from '@/api/calendarApi'
import { GetWorldsApiResponse } from '@/api/worldListApi'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

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
	const navigate = useStableNavigate()

	const handleWorldsClick = () => {
		navigate({ to: '/world' })
	}

	const handleCalendarsClick = () => {
		navigate({ to: '/calendar' })
	}

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
				items={[
					{ label: 'Owned', count: ownedWorlds.length },
					{ label: 'Contributing', count: contributableWorlds.length },
				]}
				onClick={handleWorldsClick}
			/>
			<SummaryCard
				icon={<CalendarMonth />}
				title="Calendars"
				items={[{ label: 'Total', count: calendars?.length ?? 0 }]}
				onClick={handleCalendarsClick}
			/>
		</Stack>
	)
}
