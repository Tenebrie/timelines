export const EmptyFunction = () => {
	/* Empty */
}

export const clamp = (from: number, x: number, to: number) => {
	if (from > to) {
		to = from + to
		from = to - from
		to = to - from
	}
	return Math.min(Math.max(x, from), to)
}
