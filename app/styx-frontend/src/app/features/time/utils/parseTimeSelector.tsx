type TimeDelta = {
	toYear: number | null
	toMonth: number | null
	toDay: number | null
	toHour: number | null
	toMinute: number | null
	deltaYears: number
	deltaMonths: number
	deltaWeeks: number
	deltaDays: number
	deltaHours: number
	deltaMinutes: number
}

const parseNumber = (str: string) => {
	if (str.match(/[0-9]+/)) {
		return parseInt(str)
	}
	return 0
}

const parseTime = (time: string) => {
	const parts = time.split(':')
	return {
		toHour: parts[0].includes('x') ? undefined : parseNumber(parts[0]),
		toMinute: parts[1].includes('x') ? undefined : parseNumber(parts[1]),
	}
}

const parseDate = (date: string) => {
	const parts = date.split('-')
	const year = parts[0].includes('x') ? undefined : parseNumber(parts[0])
	const month = parts[1].includes('x') || parts[1].match(/^[0]+$/) ? undefined : parseNumber(parts[1]) - 1
	const day = parts[2].includes('x') || parts[2].match(/^[0]+$/) ? undefined : parseNumber(parts[2]) - 1
	return {
		toYear: year,
		toMonth: month,
		toDay: day,
	}
}

export const parseTimeSelector = (timeSelector: string): TimeDelta => {
	const parts = timeSelector.split(' ')
	return parts
		.flatMap<Partial<TimeDelta>>((partial) => {
			const num = partial.replace(/[^-0-9\\.]/g, '')
			if (partial.match(/(y|year)[0-9]+!/)) {
				return {
					toYear: parseNumber(num),
					toMonth: 0,
					toDay: 0,
					toHour: 0,
					toMinute: 0,
				}
			} else if (partial.match(/(M|month)[0-9]+!/)) {
				return {
					toMonth: parseNumber(num) - 1,
					toDay: 0,
					toHour: 0,
					toMinute: 0,
				}
			} else if (partial.match(/(d|day)[0-9]+!/)) {
				return {
					toDay: parseNumber(num) - 1,
					toHour: 0,
					toMinute: 0,
				}
			} else if (partial.match(/(h|hour)[0-9]+!/)) {
				return {
					toHour: parseNumber(num),
					toMinute: 0,
				}
			} else if (partial.match(/(y|year)[0-9]+/)) {
				return { toYear: parseNumber(num) }
			} else if (partial.match(/(M|month)[0-9]+/)) {
				return { toMonth: parseNumber(num) - 1 }
			} else if (partial.match(/(d|day)[0-9]+/)) {
				return { toDay: parseNumber(num) - 1 }
			} else if (partial.match(/(h|hour)[0-9]+/)) {
				return { toHour: parseNumber(num) }
			} else if (partial.match(/(m|minute)[0-9]+!?/)) {
				return { toMinute: parseNumber(num) }
			} else if (partial.match(/[0-9]+(y|year|years)/)) {
				return { deltaYears: parseNumber(num) }
			} else if (partial.match(/[-0-9]+(M|month|months)/)) {
				return { deltaMonths: parseNumber(num) }
			} else if (partial.match(/[-0-9]+(w|week|weeks)/)) {
				return { deltaWeeks: parseNumber(num) }
			} else if (partial.match(/[-0-9]+(d|day|days)/)) {
				return { deltaDays: parseNumber(num) }
			} else if (partial.match(/[-0-9]+(h|hour|hours)/)) {
				return { deltaHours: parseNumber(num) }
			} else if (partial.match(/[-0-9]+(m|min|minute|minutes)/)) {
				return { deltaMinutes: parseNumber(num) }
			} else if (partial.match(/[0-9x]{2}:[0-9x]{2}/)) {
				return { ...parseTime(partial) }
			} else if (partial.match(/[0-9]+-[0-9]+-[0-9]+/)) {
				return { ...parseDate(partial) }
			}
			return {}
		})
		.reduce<TimeDelta>(
			(acc, curr) => ({
				toYear: curr.toYear ?? acc.toYear,
				toMonth: curr.toMonth ?? acc.toMonth,
				toDay: curr.toDay ?? acc.toDay,
				toHour: curr.toHour ?? acc.toHour,
				toMinute: curr.toMinute ?? acc.toMinute,
				deltaYears: acc.deltaYears + (curr.deltaYears ?? 0),
				deltaMonths: acc.deltaMonths + (curr.deltaMonths ?? 0),
				deltaWeeks: acc.deltaWeeks + (curr.deltaWeeks ?? 0),
				deltaDays: acc.deltaDays + (curr.deltaDays ?? 0),
				deltaHours: acc.deltaHours + (curr.deltaHours ?? 0),
				deltaMinutes: acc.deltaMinutes + (curr.deltaMinutes ?? 0),
			}),
			{
				toYear: null,
				toMonth: null,
				toDay: null,
				toHour: null,
				toMinute: null,
				deltaYears: 0,
				deltaMonths: 0,
				deltaWeeks: 0,
				deltaDays: 0,
				deltaHours: 0,
				deltaMinutes: 0,
			},
		)
}
