import { ExternalImageNode as ExternalImageNodeBase } from '@neverkin/tiptap-schema'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { assimilate } from '../../utils/assimilate'
import { ExternalImageView } from './ExternalImageView'

export const ExternalImageNode = assimilate(ExternalImageNodeBase).extend({
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
