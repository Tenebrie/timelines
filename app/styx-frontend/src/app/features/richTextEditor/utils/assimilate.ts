import type { Extension, Mark, Node } from '@tiptap/core'

/** The Options type a Tiptap Node/Mark/Extension instance was created with. */
type OptionsOf<T> = T extends { options: infer O } ? O : unknown
/** The Storage type a Tiptap Node/Mark/Extension instance was created with. */
type StorageOf<T> = T extends { storage: infer S } ? S : unknown

/**
 * Resolves a *foreign* Tiptap class type (from a different physical `@tiptap` copy,
 * e.g. the one bundled inside `@neverkin/tiptap-schema`) to *this* package's
 * equivalent.
 */
export type Localize<T> = T extends { config: infer C; options: unknown }
	? 'content' extends keyof C
		? Node<OptionsOf<T>, StorageOf<T>>
		: 'inclusive' extends keyof C
			? Mark<OptionsOf<T>, StorageOf<T>>
			: Extension<OptionsOf<T>, StorageOf<T>>
	: T

/**
 * Re-types a value produced against a foreign `@tiptap` copy as this package's
 * equivalent type, so `.extend()` accepts local `@tiptap/react` / `@tiptap/pm` values.
 *
 * Runtime: identity — the object is unchanged. The two copies are the same package
 * and version, so this only reconciles TypeScript's nominal view of them.
 *
 * @example
 *   export const ExternalImageNode = assimilate(ExternalImageNodeBase).extend({ ... })
 */
export function assimilate<T>(foreign: T): Localize<T> {
	return foreign as Localize<T>
}
