import { Node } from '@tiptap/core'

export type MentionPropsType = {
	actor?: string | boolean
	article?: string | boolean
	event?: string | boolean
	tag?: string | boolean
}

export const MentionNodeName = 'mentionChip'

export const MentionNode = Node.create({
	name: MentionNodeName,

	priority: 102,

	group: 'inline',
	inline: true,
	atom: true,

	addAttributes() {
		return {
			type: {
				default: 'mention',
				parseHTML: (element) => element.getAttribute('data-type') || 'mention',
				renderHTML: (attributes) => ({
					'data-type': attributes.type,
				}),
			},
			name: {
				default: null,
				parseHTML: (element) => element.getAttribute('data-name'),
				renderHTML: (attributes) => {
					if (!attributes.name) return {}
					return { 'data-name': attributes.name }
				},
			},
			componentProps: {
				default: {},
				parseHTML: (element) => {
					return JSON.parse(element.getAttribute('data-component-props') || '{}') as MentionPropsType
				},
				renderHTML: (attributes) => {
					const props = attributes.componentProps as MentionPropsType
					const filtered: MentionPropsType = {}
					if (props.actor) filtered.actor = props.actor
					if (props.event) filtered.event = props.event
					if (props.article) filtered.article = props.article
					if (props.tag) filtered.tag = props.tag
					return { 'data-component-props': JSON.stringify(filtered) }
				},
			},
		}
	},

	parseHTML() {
		return [{ tag: 'span[data-component-props]' }]
	},

	renderHTML({ HTMLAttributes }) {
		return ['span', { ...HTMLAttributes }]
	},
})
