import { Prisma } from '@prisma/client'

export function unwrapParam(
	value: boolean | Prisma.BoolFieldUpdateOperationsInput | null | undefined,
): boolean | undefined
export function unwrapParam(
	value: string | Prisma.StringFieldUpdateOperationsInput | null | undefined,
): string | undefined
export function unwrapParam(
	value:
		| string
		| boolean
		| Prisma.StringFieldUpdateOperationsInput
		| Prisma.BoolFieldUpdateOperationsInput
		| null
		| undefined,
) {
	if (value === null || value === undefined) {
		return undefined
	}
	if (typeof value === 'string' || typeof value === 'boolean') {
		return value
	}
	return value.set
}
