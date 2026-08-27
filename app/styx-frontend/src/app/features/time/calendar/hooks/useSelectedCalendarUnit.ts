import { useEffect, useRef } from 'react'

import { CalendarDraftUnit } from '@/api/types/calendarTypes'

type Props = {
	unit: CalendarDraftUnit
	onChange?: (entity: CalendarDraftUnit) => void
}

export function useSelectedCalendarUnit({ unit, onChange }: Props) {
	const prevEntityKey = useRef<string | null>(null)

	useEffect(() => {
		if (prevEntityKey.current !== unit.id) {
			prevEntityKey.current = unit.id
			onChange?.(unit)
		}
	}, [unit, onChange])
}
