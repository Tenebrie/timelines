import { Node } from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

import { dispatchGlobalEvent } from '@/app/features/eventBus'
import { store } from '@/app/store'
import {
	registerMentionMount,
	unregisterMentionMount,
	updateMentionMount,
} from '@/app/views/world/components/MentionPortalHost'

import { resolveEntityName } from '../hooks/resolveEntityName'

export const MentionNodeName = 'mentionChip'

const getActorName = (node: ProseMirrorNode) => {
	const actorId = node.attrs.componentProps.actor as string | undefined
	if (!actorId) return null
	return store.getState().world.actors.find((actor) => actor.id === actorId)?.name ?? 'Unknown actor'
}

const getEventName = (node: ProseMirrorNode) => {
	const eventId = node.attrs.componentProps.event as string | undefined
	if (!eventId) return null
	return store.getState().world.events.find((event) => event.id === eventId)?.name ?? 'Unknown event'
}

const getArticleName = (node: ProseMirrorNode) => {
	const articleId = node.attrs.componentProps.article as string | undefined
	if (!articleId) return null
	return store.getState().wiki.articles.find((article) => article.id === articleId)?.name ?? 'Unknown article'
}

const getTagName = (node: ProseMirrorNode) => {
	const tagId = node.attrs.componentProps.tag as string | undefined
	if (!tagId) return null
	return store.getState().world.tags.find((tag) => tag.id === tagId)?.name ?? 'Unknown tag'
}

type MentionPropsType = {
	actor?: string | boolean
	article?: string | boolean
	event?: string | boolean
	tag?: string | boolean
}

const mentionSelectionKey = new PluginKey('mentionSelectionDecoration')

let mentionIdCounter = 0
const nextMentionId = () => `mention-${++mentionIdCounter}`

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

	renderText({ node }) {
		const name =
			getActorName(node) ?? getEventName(node) ?? getArticleName(node) ?? getTagName(node) ?? 'Unknown entity'
		return `[${name}]`
	},

	addProseMirrorPlugins() {
		return [
			new Plugin({
				props: {
					handleClickOn(view, pos, node, nodePos, event, direct) {
						if (!direct) return false
						if (node.type.name !== MentionNodeName) return false
						const tr = view.state.tr.setSelection(TextSelection.create(view.state.doc, nodePos))
						view.dispatch(tr)
						return true
					},
				},
			}),
			new Plugin({
				key: mentionSelectionKey,
				props: {
					decorations(state) {
						const sel = state.selection
						if (!(sel instanceof TextSelection)) return DecorationSet.empty
						if (sel.empty) return DecorationSet.empty

						const decos: Decoration[] = []
						state.doc.nodesBetween(sel.from, sel.to, (node, pos) => {
							if (node.type.name !== MentionNodeName) return
							if (pos >= sel.from && pos + node.nodeSize <= sel.to) {
								decos.push(
									Decoration.node(pos, pos + node.nodeSize, {
										class: 'mention-in-range',
									}),
								)
							}
						})
						return DecorationSet.create(state.doc, decos)
					},
				},
			}),
		]
	},

	addNodeView() {
		return ({ node: initialNode }) => {
			const id = nextMentionId()
			const dom = document.createElement('span')
			dom.setAttribute('data-type', 'mention')

			const caretAnchor = document.createTextNode('\u200B')
			const mountPoint = document.createElement('span')
			const caretAnchorAfter = document.createTextNode('\u200B')

			dom.appendChild(caretAnchor)
			dom.appendChild(mountPoint)
			dom.appendChild(caretAnchorAfter)

			let lastNode: ProseMirrorNode = initialNode
			let lastProps: MentionPropsType = initialNode.attrs.componentProps as MentionPropsType

			const buildMount = (node: ProseMirrorNode) => {
				const props = node.attrs.componentProps as MentionPropsType
				const actorId = typeof props.actor === 'string' ? props.actor : undefined
				const eventId = typeof props.event === 'string' ? props.event : undefined
				const articleId = typeof props.article === 'string' ? props.article : undefined
				const tagId = typeof props.tag === 'string' ? props.tag : undefined

				const entityId = actorId ?? eventId ?? articleId ?? tagId
				if (entityId) {
					const entityName = resolveEntityName({ entityId })
					dom.setAttribute('data-name', entityName)
				}

				return {
					id,
					element: mountPoint,
					actorId,
					eventId,
					articleId,
					tagId,
					fallbackName: node.attrs.name as string | undefined,
				}
			}

			const propsChanged = (a: MentionPropsType, b: MentionPropsType) =>
				a.actor !== b.actor || a.event !== b.event || a.article !== b.article || a.tag !== b.tag

			registerMentionMount(buildMount(initialNode))
			dispatchGlobalEvent['richEditor/mentionRender/onStart']({ node: initialNode })

			// The portal host commits asynchronously on its next React render.
			// Fire onEnd after a microtask so listeners observe the mount.
			queueMicrotask(() => {
				dispatchGlobalEvent['richEditor/mentionRender/onEnd']({ node: initialNode })
			})

			return {
				dom,
				update: (node) => {
					if (node.type !== initialNode.type) return false
					if (node === lastNode) return true

					const newProps = node.attrs.componentProps as MentionPropsType
					const changed = propsChanged(lastProps, newProps) || node.attrs.name !== lastNode.attrs.name
					lastNode = node
					lastProps = newProps

					if (!changed) return true

					dispatchGlobalEvent['richEditor/mentionRender/onEnd']({ node: lastNode })
					dispatchGlobalEvent['richEditor/mentionRender/onStart']({ node })

					updateMentionMount(buildMount(node))

					queueMicrotask(() => {
						dispatchGlobalEvent['richEditor/mentionRender/onEnd']({ node })
					})
					return true
				},
				destroy: () => {
					dispatchGlobalEvent['richEditor/mentionRender/onEnd']({ node: lastNode })
					unregisterMentionMount(id)
				},
			}
		}
	},
})
