let scroll = 0

export const useTimelineScroll = () => {
	return {
		getScroll: () => scroll,
		setScroll: (value: number) => (scroll = value),
	}
}
