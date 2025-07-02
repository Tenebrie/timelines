export const keysOf = <T extends string | number | symbol>(object: Record<T, unknown> | undefined) => {
	if (!object) {
		return []
	}
	return Object.keys(object) as (keyof typeof object)[]
}
