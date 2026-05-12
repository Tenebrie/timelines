import { useGetAssetQuery } from '@api/assetApi'
import { Node, nodePasteRule, NodeViewProps } from '@tiptap/core'
import { DOMSerializer } from '@tiptap/pm/model'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { useLayoutEffect, useRef } from 'react'
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
			assetId: {
				default: null,
				parseHTML: (element) => element.getAttribute('data-asset-id'),
				renderHTML: (attributes) => ({ 'data-asset-id': attributes.assetId }),
			},
			src: {
				default: null,
				renderHTML: (attributes) => {
					if (!attributes.src) return {}
					return { src: new URL(attributes.src, window.location.origin).href }
				},
			},
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
		return [
			{ tag: 'img[src]', priority: 1000 },
			{ tag: 'img[data-asset-id]', priority: 1000 },
		]
	},
	renderHTML({ HTMLAttributes }) {
		return ['img', HTMLAttributes]
	},
	addNodeView() {
		return ReactNodeViewRenderer(ExternalImageView)
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

export function ExternalImageView({ node, editor, updateAttributes }: NodeViewProps) {
	const assetId = node.attrs.assetId as string

	const { data } = useGetAssetQuery({ assetId }, { skip: !assetId })

	const ref = useRef<HTMLDivElement>(null)

	useLayoutEffect(() => {
		if (data?.url && data.url !== node.attrs.src) {
			updateAttributes({ src: data.url })
		}
	}, [data?.url, node.attrs.src, updateAttributes])

	useLayoutEffect(() => {
		if (!ref.current) {
			return
		}

		const serializer = DOMSerializer.fromSchema(editor.schema)
		const dom = serializer.serializeNode(node) as HTMLElement
		ref.current.replaceChildren(dom)
	}, [node, editor.schema, data])

	return <NodeViewWrapper ref={ref} />
}
