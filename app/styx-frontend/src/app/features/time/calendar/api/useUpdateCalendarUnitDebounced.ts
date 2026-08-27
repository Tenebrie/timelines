import { UpdateCalendarUnitApiArg, useUpdateCalendarUnitMutation } from '@api/calendarApi'
import debounce from 'lodash.debounce'
import { useMemo } from 'react'

export function useUpdateCalendarUnitDebounced() {
	const [updateUnitMutation, data] = useUpdateCalendarUnitMutation()

	const updateUnit = useMemo(
		() =>
			debounce((args: { calendarId: string; unitId: string; body: UpdateCalendarUnitApiArg['body'] }) => {
				updateUnitMutation(args)
			}, 300),
		[updateUnitMutation],
	)

	return [updateUnit, data] as const
}
