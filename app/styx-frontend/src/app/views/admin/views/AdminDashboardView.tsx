import Groups from '@mui/icons-material/Groups'
import Login from '@mui/icons-material/Login'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Shield from '@mui/icons-material/Shield'
import Storage from '@mui/icons-material/Storage'
import LinearProgress from '@mui/material/LinearProgress'
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

function formatBytes(bytes: number): string {
	const gb = bytes / (1024 * 1024 * 1024)
	if (gb >= 1000) return `${(gb / 1024).toFixed(2)} TB`
	return `${gb.toFixed(2)} GB`
}

function StorageCard({ label, free, total }: { label: string; free: number; total: number }) {
	const used = total - free
	const usedPercent = total > 0 ? (used / total) * 100 : 0
	const color = usedPercent > 90 ? 'error' : usedPercent > 75 ? 'warning' : 'primary'

	return (
		<Paper
			variant="outlined"
			sx={{
				padding: '16px 20px',
				flex: '1 1 0',
				minWidth: 200,
				display: 'flex',
				flexDirection: 'column',
				gap: 1,
			}}
		>
			<Typography variant="body2" color="text.secondary">
				{label}
			</Typography>
			<LinearProgress
				variant="determinate"
				value={usedPercent}
				color={color}
				sx={{ height: 8, borderRadius: 4 }}
			/>
			<Stack direction="row" justifyContent="space-between">
				<Typography variant="caption" color="text.secondary">
					{formatBytes(used)} used of {formatBytes(total)}
				</Typography>
				<Typography variant="caption" fontWeight={600} color={`${color}.main`}>
					{usedPercent.toFixed(1)}%
				</Typography>
			</Stack>
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
	const { data, fulfilledTimeStamp } = useAdminGetDashboardQuery(undefined, {
		pollingInterval: 30_000,
	})

	if (!data) {
		return <></>
	}

	const { auditStats, fileSystemStats } = data

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
