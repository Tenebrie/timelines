export const useWorldTime = () => {
	const pixelsPerHour = 40
	const hoursInDay = 24
	const minutesInHour = 60

	const timeToLabel = (time: number, includeTime = true) => {
		const timeInDay = pixelsPerHour * hoursInDay
		const timeInHour = pixelsPerHour
		const timeInMinute = pixelsPerHour / minutesInHour

		const days = Math.floor(time / timeInDay)
		const hours = Math.floor((time - days * timeInDay) / timeInHour)
		const minutes = Math.floor((time - days * timeInDay - hours * timeInHour) / timeInMinute)

		// return {
		// 	values: [days, hours, minutes],
		// 	labels: ['D', 'H', 'M'],
		// }

		if (includeTime) {
			return `Day ${days}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
		}
		return `Day ${days}`
	}

	const getTimelineMultipliers = () => {
		return {}
	}

	return {
		timeToLabel,
		getTimelineMultipliers,
	}
}
