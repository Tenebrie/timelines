export const useWorldTime = () => {
	const timeToLabel = (time: number, includeTime: boolean) => {
		const timeInDay = 1000
		const timeInHour = 1000 / 25
		const timeInMinute = 1000 / 25 / 60

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

	return {
		timeToLabel,
	}
}
