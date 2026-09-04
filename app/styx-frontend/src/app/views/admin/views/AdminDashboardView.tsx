import Groups from '@mui/icons-material/Groups'
import Login from '@mui/icons-material/Login'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Shield from '@mui/icons-material/Shield'
import Storage from '@mui/icons-material/Storage'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

import { useAdminGetDashboardQuery } from '@/api/adminUsersApi'

import { AdminDashboardStatCard } from '../components/AdminDashboardStatCard'
import { AdminDashboardStorageCard } from '../components/AdminDashboardStorageCard'
import { AdminDashboardUserActivityChart } from '../components/AdminDashboardUserActivityChart'

export function AdminDashboardView() {
	const { data, fulfilledTimeStamp } = useAdminGetDashboardQuery(undefined, {
		pollingInterval: 30_000,
	})

	if (!data) {
		return <></>
	}

	const { auditStats, fileSystemStats } = data

	const StatCard = AdminDashboardStatCard
	const StorageCard = AdminDashboardStorageCard

	return (
		<Stack gap={2.5} width="100%" alignSelf="center">
			{fulfilledTimeStamp && (
				<Typography variant="caption" color="text.secondary" alignSelf="flex-end">
					Last updated: {new Date(fulfilledTimeStamp).toLocaleTimeString()}
				</Typography>
			)}
			<Section icon={<Groups color="primary" />} title="Active Users">
				<StatCard label="Daily" value={data.dailyActiveUsers} sub="Last 24 hours" />
				<StatCard label="Weekly" value={data.weeklyActiveUsers} sub="Last 7 days" />
				<StatCard label="Monthly" value={data.monthlyActiveUsers} sub="Last 30 days" />
				<AdminDashboardUserActivityChart activity={data.hourlyActivity} />
			</Section>

			<Section icon={<PersonAdd color="success" />} title="Accounts (30 Days)">
				<StatCard label="Guest Created" value={auditStats.guestAccountsCreated} />
				<StatCard label="User Created" value={auditStats.userAccountsCreated} />
				<StatCard label="Deleted" value={auditStats.accountsDeleted} />
			</Section>

			<Section icon={<Login color="info" />} title="Login Activity (30 Days)">
				<StatCard label="Auth" value={auditStats.userAuthEvents} />
				<StatCard label="Password" value={auditStats.passwordLogins} />
				<StatCard label="Google" value={auditStats.googleLogins} />
				<StatCard label="Failed" value={auditStats.failedLogins} />
			</Section>

			<Section icon={<Shield color="warning" />} title="Total Activity (30 Days)">
				<StatCard label="Total Audited Events" value={auditStats.totalEvents} />
			</Section>

			<Section icon={<Storage color="secondary" />} title="Storage">
				<StorageCard label="Root" free={fileSystemStats.root.free} total={fileSystemStats.root.total} />
				<StorageCard
					label="Database"
					free={fileSystemStats.database.free}
					total={fileSystemStats.database.total}
				/>
			</Section>
		</Stack>
	)
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
	const theme = useTheme()
	return (
		<Paper
			variant="outlined"
			sx={{
				padding: 2.5,
				borderRadius: 2,
				background: theme.palette.background.default,
			}}
		>
			<Stack direction="row" alignItems="center" gap={1} marginBottom={2}>
				{icon}
				<Typography variant="subtitle1" fontWeight={600}>
					{title}
				</Typography>
			</Stack>
			<Stack direction="row" gap={2} flexWrap="wrap">
				{children}
			</Stack>
		</Paper>
	)
}
