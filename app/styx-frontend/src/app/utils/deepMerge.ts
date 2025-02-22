import { DeepPartial } from '@/app/types/utils'

function isObject(item: unknown): item is Record<string, unknown> {
	return item !== null && typeof item === 'object' && !Array.isArray(item)
}

export function deepMerge<T extends Record<string, unknown>>(targetBase: T, source: DeepPartial<T>): T {
	const target = { ...targetBase }
	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (key in source) {
				const sourceValue = source[key]
				const targetValue = target[key]

				if (isObject(sourceValue) && isObject(targetValue)) {
					target[key] = deepMerge(
						targetValue as Record<string, unknown>,
						sourceValue as Record<string, unknown>,
					) as T[Extract<keyof DeepPartial<T>, string>]
				} else {
					target[key] = sourceValue as T[Extract<keyof DeepPartial<T>, string>]
				}
			}
		}
	}
	return target
}
