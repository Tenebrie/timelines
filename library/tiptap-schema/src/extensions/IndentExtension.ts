import { Extension } from '@tiptap/core'
import type { Transaction } from '@tiptap/pm/state'

const INDENT_TYPES = ['paragraph', 'heading']
export const MAX_INDENT_LEVEL = 8

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		indent: {
			indent: () => ReturnType
			outdent: () => ReturnType
		}
	}
}

// Whole-block indentation as a data-indent attribute. Keyboard behavior lives in
// TabNode, which dispatches between tab characters and block indent.
export const IndentExtension = Extension.create({
	name: 'indent',

	addGlobalAttributes() {
		return [
			{
				types: INDENT_TYPES,
				attributes: {
					indent: {
						default: 0,
						parseHTML: (element) => Number(element.getAttribute('data-indent')) || 0,
						renderHTML: (attributes) => {
							if (!attributes.indent) return {}
							return { 'data-indent': attributes.indent }
						},
					},
				},
			},
		]
	},

	addCommands() {
		return {
			indent:
				() =>
				({ tr }) =>
					updateIndentLevel(tr, 1),
			outdent:
				() =>
				({ tr }) =>
					updateIndentLevel(tr, -1),
		}
	},
})

function updateIndentLevel(tr: Transaction, delta: number): boolean {
	let changed = false
	tr.doc.nodesBetween(tr.selection.from, tr.selection.to, (node, pos) => {
		if (!INDENT_TYPES.includes(node.type.name)) {
			return
		}
		const indent = Math.max(0, Math.min(MAX_INDENT_LEVEL, node.attrs.indent + delta))
		if (indent !== node.attrs.indent) {
			tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent })
			changed = true
		}
		return false
	})
	return changed
}
