import { Node, nodePasteRule } from '@tiptap/core'
import z from 'zod'

const PropsSchema = z.object({
	sizeX: z.number().optional(),
	sizeY: z.number().optional(),
})

export const ExternalImageNode = Node.create({
	name: 'externalImageNode',
	inline: false,
	group: 'block',
	addAttributes() {
		return {
			src: { default: null },
			alt: { default: null },
			type: {
				default: 'embeddedImage',
				parseHTML: (element) => element.getAttribute('data-type') || 'embeddedImage',
				renderHTML: (attributes) => ({
					'data-type': attributes.type,
				}),
			},
			externalImageProps: {
				default: {},
				parseHTML: (element) => {
					return PropsSchema.parse(JSON.parse(element.getAttribute('data-external-image-props') || '{}'))
				},
				renderHTML: (attributes) => {
					const props = attributes.externalImageProps as z.infer<typeof PropsSchema>
					return { 'data-external-image-props': JSON.stringify(props) }
				},
			},
		}
	},
	parseHTML() {
		return [{ tag: 'img[src]', priority: 1000 }]
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
