import { useGetAssetQuery } from '@api/assetApi'
import { useTheme } from '@mui/material/styles'
import { ExternalImageNode as ExternalImageNodeBase } from '@neverkin/tiptap-schema'
import { NodeViewProps } from '@tiptap/core'
import { DOMSerializer } from '@tiptap/pm/model'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { useEffect, useLayoutEffect, useRef } from 'react'

export const ExternalImageNode = ExternalImageNodeBase.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			src: {
				default: null,
				renderHTML: (attributes) => {
					if (!attributes.src) return {}
					return { src: new URL(String(attributes.src), window.location.origin).href }
				},
			},
		}
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
