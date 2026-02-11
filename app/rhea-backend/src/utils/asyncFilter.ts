export async function asyncFilter<T>(arr: T[], predicate: (item: T) => Promise<boolean>): Promise<T[]> {
	const results = await Promise.all(arr.map(predicate))
	return arr.filter((_, index) => results[index])
}
