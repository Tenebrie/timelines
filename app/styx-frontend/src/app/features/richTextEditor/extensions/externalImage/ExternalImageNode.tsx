import { useGetAssetQuery } from '@api/assetApi'
import { useTheme } from '@mui/material/styles'
import { ExternalImageNode as ExternalImageNodeBase } from '@neverkin/tiptap-schema'
import { NodeViewProps } from '@tiptap/core'
import { DOMSerializer } from '@tiptap/pm/model'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { useEffect, useRef } from 'react'

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
		if (!data || !data.url || data.url === node.attrs.src) {
			return
		}

		const incomingTimestamp = (() => {
			const url = new URLSearchParams(data.url.split('?')[1])
			const issuedAt = url.get('X-Amz-Date')
			const parsed = issuedAt
				? new Date(issuedAt.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, '$1-$2-$3T$4:$5:$6Z'))
				: null
			if (!parsed) {
				return 0
			}
			return parsed.getTime()
		})()
		const previousTimestamp = (() => {
			if (!node.attrs.src) {
				return 0
			}
			const url = new URLSearchParams(node.attrs.src.split('?')[1])
			const issuedAt = url.get('X-Amz-Date')
			const parsed = issuedAt
				? new Date(issuedAt.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, '$1-$2-$3T$4:$5:$6Z'))
				: null
			if (!parsed) {
				return 0
			}
			return parsed.getTime()
		})()

		if (previousTimestamp > incomingTimestamp) {
			console.log('Bail')
			return
		}

		requestAnimationFrame(() => {
			console.log('Qeuue')
			if (!editor.isDestroyed) {
				console.log('SET', data.url)
				updateAttributes({ src: data.url })
			}
		})
	}, [data, data?.url, editor.isDestroyed, node.attrs.src, updateAttributes])

	useEffect(() => {
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
