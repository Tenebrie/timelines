function isObject(item: unknown): item is Record<string, unknown> {
	return item !== null && typeof item === 'object' && !Array.isArray(item)
}

export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				const sourceValue = source[key]
				const targetValue = target[key]

				if (isObject(sourceValue) && isObject(targetValue)) {
					target[key] = deepMerge(
						targetValue as Record<string, unknown>,
						sourceValue as Record<string, unknown>,
					) as T[Extract<keyof T, string>]
				} else {
					target[key] = sourceValue as T[Extract<keyof T, string>]
				}
			}
		}
	}
	return target
}
