import { AdminGetDashboardApiResponse } from '@/api/adminUsersApi'

import { AdminDashboardStatCard } from './AdminDashboardStatCard'

type ContentStats = AdminGetDashboardApiResponse['contentStats']

type Props = {
	stats: ContentStats
}

export function AdminDashboardContentCards({ stats }: Props) {
	const labels = stats.days.map((day) => dayFormat.format(new Date(day)))
	return (
		<>
			{ENTITY_LABELS.map(([key, label]) => (
				<AdminDashboardStatCard
					key={key}
					label={label}
					value={stats.entities[key].total}
					series={stats.entities[key].created.map((value, i) => ({ label: labels[i], value }))}
				/>
			))}
		</>
	)
}

const ENTITY_LABELS: [keyof ContentStats['entities'], string][] = [
	['worlds', 'Worlds'],
	['actors', 'Actors'],
	['events', 'Events'],
	['eventTracks', 'Event Tracks'],
	['articles', 'Articles'],
	['folders', 'Folders'],
	['tags', 'Tags'],
	['nodes', 'Mindmap Nodes'],
	['links', 'Mindmap Links'],
	['calendars', 'Calendars'],
	['contentPages', 'Content Pages'],
	['assets', 'Assets'],
]

const dayFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
