import Groups from '@mui/icons-material/Groups'
import Login from '@mui/icons-material/Login'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Shield from '@mui/icons-material/Shield'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

import { useAdminGetDashboardQuery } from '@/api/adminUsersApi'

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
	return (
		<Paper
			variant="outlined"
			sx={{
				padding: '16px 20px',
				flex: '1 1 0',
				minWidth: 120,
				display: 'flex',
				flexDirection: 'column',
				gap: 0.25,
			}}
		>
			<Typography variant="body2" color="text.secondary">
				{label}
			</Typography>
			<Typography variant="h4" fontWeight="bold">
				{value}
			</Typography>
			{sub && (
				<Typography variant="caption" color="text.secondary">
					{sub}
				</Typography>
			)}
		</Paper>
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

export function AdminDashboardView() {
	const { data } = useAdminGetDashboardQuery()

	if (!data) {
		return <></>
	}

	const { auditStats } = data

	return (
		<Stack padding={3} gap={2.5} width="100%" maxWidth={900} alignSelf="center">
			<Section icon={<Groups color="primary" />} title="Active Users">
				<StatCard label="Daily" value={data.dailyActiveUsers} sub="Last 24 hours" />
				<StatCard label="Weekly" value={data.weeklyActiveUsers} sub="Last 7 days" />
				<StatCard label="Monthly" value={data.monthlyActiveUsers} sub="Last 30 days" />
			</Section>

			<Section icon={<PersonAdd color="success" />} title="Accounts (30 Days)">
				<StatCard label="Guest Created" value={auditStats.guestAccountsCreated} />
				<StatCard label="User Created" value={auditStats.userAccountsCreated} />
				<StatCard label="Deleted" value={auditStats.accountsDeleted} />
			</Section>

			<Section icon={<Login color="info" />} title="Login Activity (30 Days)">
				<StatCard label="Password" value={auditStats.passwordLogins} />
				<StatCard label="Google" value={auditStats.googleLogins} />
				<StatCard label="Failed" value={auditStats.failedLogins} />
				<StatCard label="Unique Users" value={auditStats.uniqueUserLogins} />
			</Section>

			<Section icon={<Shield color="warning" />} title="Admin Activity (30 Days)">
				<StatCard label="Impersonations" value={auditStats.adminImpersonations} />
				<StatCard label="Total Events" value={auditStats.totalEvents} />
			</Section>
		</Stack>
	)
}
