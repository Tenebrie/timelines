export const keysOf = <T extends string | number | symbol>(object: Record<T, unknown>) => {
	return Object.keys(object) as (keyof typeof object)[]
}
