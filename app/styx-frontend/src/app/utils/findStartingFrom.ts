export const findStartingFrom = <T>(
	array: T[],
	startIndex: number,
	predicate: (item: T) => boolean,
): T | undefined => {
	for (let i = startIndex; i < array.length; i++) {
		if (predicate(array[i])) {
			return array[i]
		}
	}
	return undefined
}
