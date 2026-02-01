import { useMemo } from 'react'

import { useListCalendarsQuery } from '@/api/calendarApi'

import { useWorldListData } from '../../worldManagement/hooks/useWorldListData'

export type RecentActivity = {
	id: string
	name: string
	type: 'world' | 'calendar'
	updatedAt: Date
}

export function useRecentActivity() {
	const { ownedWorlds, contributableWorlds, isFetching: isWorldsFetching } = useWorldListData()
	const { data: calendars, isLoading: isCalendarsLoading } = useListCalendarsQuery()

	const isLoading = isWorldsFetching || isCalendarsLoading

	const recentActivity = useMemo(() => {
		const activities: RecentActivity[] = []

		// Add worlds
		ownedWorlds.forEach((world) => {
			activities.push({
				id: world.id,
				name: world.name,
				type: 'world',
				updatedAt: new Date(world.updatedAt),
			})
		})

		contributableWorlds.forEach((world) => {
			activities.push({
				id: world.id,
				name: world.name,
				type: 'world',
				updatedAt: new Date(world.updatedAt),
			})
		})

		// Add calendars
		calendars?.forEach((calendar) => {
			activities.push({
				id: calendar.id,
				name: calendar.name,
				type: 'calendar',
				updatedAt: new Date(calendar.updatedAt),
			})
		})

		// Sort by most recent first
		activities.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

		// Return top 10 most recent
		return activities.slice(0, 10)
	}, [ownedWorlds, contributableWorlds, calendars])

	return {
		recentActivity,
		isLoading,
		ownedWorlds,
		contributableWorlds,
		calendars,
	}
}
