import { isMacOS } from '@tiptap/core'

const MACOS_PREFIX = 'macos:'

/**
 * Parses an input definition into the alternatives it allows, each as a list of keys.
 * Alternatives are separated by `|`, keys within one by `+`, and a `macos:` prefix
 * limits an alternative to macOS.
 *
 * 'Delete|macos:Backspace' -> [['Delete']], or [['Delete'], ['Backspace']] on macOS
 */
export function parseInputCombos(definition: string): string[][] {
	return definition
		.split('|')
		.filter((combo) => !combo.startsWith(MACOS_PREFIX) || isMacOS())
		.map((combo) => combo.replace(MACOS_PREFIX, '').split('+'))
}
