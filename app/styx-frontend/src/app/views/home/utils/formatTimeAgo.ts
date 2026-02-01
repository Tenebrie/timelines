export function formatTimeAgo(date: Date): string {
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffSeconds = Math.floor(diffMs / 1000)
	const diffMinutes = Math.floor(diffSeconds / 60)
	const diffHours = Math.floor(diffMinutes / 60)
	const diffDays = Math.floor(diffHours / 24)

	if (diffSeconds < 60) {
		return 'just now'
	} else if (diffMinutes < 60) {
		return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
	} else if (diffHours < 24) {
		return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
	} else if (diffDays < 7) {
		return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
	} else {
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		})
	}
}
