import { useGetAssetQuery } from '@api/assetApi'
import { useTheme } from '@mui/material/styles'
import { Node, NodeViewProps } from '@tiptap/core'
import { DOMSerializer } from '@tiptap/pm/model'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import z from 'zod'

const PropsSchema = z.object({
	sizeX: z.number().optional().nullable(),
	sizeY: z.number().optional().nullable(),
})

/** TODO:
 * - Image resizing
 *
 * - Unrelated, but support for colors/fonts
 * - Support for renamed urls
 */
export const ExternalImageNode = Node.create({
	name: 'externalImageNode',
	inline: false,
	group: 'block',
	addAttributes() {
		return {
			assetId: {
				default: null,
				parseHTML: (element) => element.getAttribute('data-asset-id'),
				renderHTML: (attributes) => {
					if (!attributes.assetId) return {}
					return { 'data-asset-id': attributes.assetId }
				},
			},
			uploadId: {
				default: null,
				parseHTML: (element) => element.getAttribute('data-upload-id'),
				renderHTML: (attributes) => {
					if (!attributes.uploadId) return {}
					return { 'data-upload-id': attributes.uploadId }
				},
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
})

export function ExternalImageView({ node, editor, selected, updateAttributes }: NodeViewProps) {
	const assetId = node.attrs.assetId as string
	const theme = useTheme()

	const { data } = useGetAssetQuery(
		{ assetId },
		{ skip: !assetId || assetId === 'undefined', refetchOnMountOrArgChange: 600 },
	)

	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (data?.url && data.url !== node.attrs.src) {
			requestAnimationFrame(() => {
				if (!editor.isDestroyed) {
					updateAttributes({ src: data.url })
				}
			})
		}
	}, [data?.url, editor.isDestroyed, node.attrs.src, updateAttributes])

	useLayoutEffect(() => {
		if (!ref.current) {
			return
		}

		const serializer = DOMSerializer.fromSchema(editor.schema)
		const dom = serializer.serializeNode(node) as HTMLElement
		ref.current.replaceChildren(dom)
	}, [node, editor.schema, data])

	return (
		<NodeViewWrapper
			ref={ref}
			style={{
				display: 'inline-block',
				outline: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
				outlineOffset: 2,
				borderRadius: 2,
				transition: 'outline-color 120ms ease',
			}}
		/>
	)
}
