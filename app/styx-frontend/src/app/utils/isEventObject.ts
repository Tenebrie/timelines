export const isEventObject = (value: unknown): value is Event => {
	return (
		value !== null && typeof value === 'object' && 'isDefaultPrevented' in value && 'preventDefault' in value
	)
}
