import { ExternalImageNode as ExternalImageNodeBase } from '@neverkin/tiptap-schema'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { ExternalImageView } from './ExternalImageView'

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
