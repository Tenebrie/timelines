import { Node, nodePasteRule } from '@tiptap/core'

export const ExternalImageNode = Node.create({
	name: 'externalImageNode',
	inline: false,
	group: 'block',
	addAttributes() {
		return {
			src: { default: null },
			alt: { default: null },
		}
	},
	parseHTML() {
		return [{ tag: 'img[src]' }]
	},
	renderHTML({ HTMLAttributes }) {
		return ['img', HTMLAttributes]
	},
	addPasteRules() {
		return [
			nodePasteRule({
				find: /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/gi,
				type: this.type,
				getAttributes: (match) => ({
					src: match[0],
				}),
			}),
		]
	},
})
