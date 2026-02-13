/**
 * Deduplicate an array of entities that have an ID field, based on said ID field.
 */

export function deduplicateById<T extends { id: string }>(items: T[]): T[] {
	const seen = new Set<string>()
	return items.filter((item) => {
		if (seen.has(item.id)) {
			return false
		}
		seen.add(item.id)
		return true
	})
}
