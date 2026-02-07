import { useSearch } from '@tanstack/react-router'

import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { CalendarEditorTab } from '../types'

export function useCalendarEditorTab() {
	const { tab } = useSearch({ from: '/calendar/$calendarId' })

	const navigate = useStableNavigate({ from: '/calendar/$calendarId' })
	const setTab = (tab: CalendarEditorTab) => {
		navigate({ search: (prev) => ({ ...prev, tab }) })
	}

	return [tab, setTab] as const
}
