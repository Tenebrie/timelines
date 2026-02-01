import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'

import { DashboardHeader } from './components/DashboardHeader'
import { RecentActivitySection } from './components/RecentActivitySection'
import { SummaryCardsSection } from './components/SummaryCardsSection'
import { useRecentActivity } from './hooks/useRecentActivity'

export function HomeView() {
	const { recentActivity, isLoading, ownedWorlds, contributableWorlds, calendars } = useRecentActivity()

	if (isLoading) {
		return (
			<Stack width="100%" height="100%" alignItems="center" justifyContent="center">
				<CircularProgress />
			</Stack>
		)
	}

	return (
		<Stack width="100%" height="100%" alignItems="center" sx={{ overflowY: 'auto' }}>
			<Container maxWidth="md" sx={{ py: 4 }}>
				<Stack gap={4}>
					<DashboardHeader />
					<SummaryCardsSection
						ownedWorlds={ownedWorlds}
						contributableWorlds={contributableWorlds}
						calendars={calendars}
					/>
					<RecentActivitySection activities={recentActivity} />
				</Stack>
			</Container>
		</Stack>
	)
}
