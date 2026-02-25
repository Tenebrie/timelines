import { Node } from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { createRoot, Root } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'

import { dispatchGlobalEvent } from '@/app/features/eventBus'
import { CustomThemeProvider } from '@/app/features/theming/context/CustomThemeProvider'
import { store } from '@/app/store'
import { useEffectOnce } from '@/app/utils/useEffectOnce'

import { resolveEntityName } from '../hooks/resolveEntityName'
import { ActorMentionChip } from './chips/ActorMentionChip'
import { ArticleMentionChip } from './chips/ArticleMentionChip'
import { EventMentionChip } from './chips/EventMentionChip'
import { TagMentionChip } from './chips/TagMentionChip'

export const MentionNodeName = 'mentionChip'

const getActorName = (node: ProseMirrorNode) => {
	const actorId = node.attrs.componentProps.actor as string | undefined
	if (!actorId) {
		return null
	}
	const name = store.getState().world.actors.find((actor) => actor.id === actorId)?.name ?? 'Unknown actor'
	return name
}

const getEventName = (node: ProseMirrorNode) => {
	const eventId = node.attrs.componentProps.event as string | undefined
	if (!eventId) {
		return null
	}
	const name = store.getState().world.events.find((event) => event.id === eventId)?.name ?? 'Unknown event'
	return name
}

const getArticleName = (node: ProseMirrorNode) => {
	const articleId = node.attrs.componentProps.article as string | undefined
	if (!articleId) {
		return null
	}
	const name =
		store.getState().wiki.articles.find((article) => article.id === articleId)?.name ?? 'Unknown article'
	return name
}

const getTagName = (node: ProseMirrorNode) => {
	const tagId = node.attrs.componentProps.tag as string | undefined
	if (!tagId) {
		return null
	}
	const name = store.getState().world.tags.find((tag) => tag.id === tagId)?.name ?? 'Unknown tag'
	return name
}

type MentionPropsType = {
	actor?: string | boolean
	event?: string | boolean
	article?: string | boolean
}

export const MentionNode = Node.create({
	name: MentionNodeName,

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
					return {
						'data-name': attributes.name,
					}
				},
			},
			componentProps: {
				default: {},
				parseHTML: (element) => {
					const props = JSON.parse(element.getAttribute('data-component-props') || '{}') as MentionPropsType
					return props
				},
				renderHTML: (attributes) => {
					// Only include non-null/non-false values
					const props = attributes.componentProps as MentionPropsType
					const filtered: MentionPropsType = {}
					if (props.actor) filtered.actor = props.actor
					if (props.event) filtered.event = props.event
					if (props.article) filtered.article = props.article
					return {
						'data-component-props': JSON.stringify(filtered),
					}
				},
			},
		}
	},

	parseHTML() {
		return [
			{
				tag: 'span[data-component-props]',
			},
		]
	},

	renderHTML({ HTMLAttributes }) {
		return ['span', { ...HTMLAttributes }]
	},

	renderText({ node }) {
		const name =
			getActorName(node) ?? getEventName(node) ?? getArticleName(node) ?? getTagName(node) ?? 'Unknown entity'
		return `[${name}]`
	},

	addNodeView() {
		return ({ node: initialNode }) => {
			let root: Root | null = null
			const dom = document.createElement('span')
			dom.setAttribute('data-type', 'mention')

			let lastNode: ProseMirrorNode = initialNode

			const rerender = (node: ProseMirrorNode) => {
				if (!root) {
					return
				}
				const actorId = node.attrs.componentProps.actor as string | undefined
				const eventId = node.attrs.componentProps.event as string | undefined
				const articleId = node.attrs.componentProps.article as string | undefined
				const tagId = node.attrs.componentProps.tag as string | undefined
				const state = store.getState()
				const worldId = state.world.id
				const fallbackName = node.attrs.name

				const entityId = actorId ?? eventId ?? articleId ?? tagId
				if (entityId) {
					const entityName = resolveEntityName({ entityId })
					dom.setAttribute('data-name', entityName)
				}

				const Component = () => {
					useEffectOnce(() => {
						dispatchGlobalEvent['richEditor/mentionRender/onEnd']({ node })
					})

					return (
						<ReduxProvider store={store}>
							<CustomThemeProvider colorMode={state.preferences.colorMode}>
								{actorId ? (
									<ActorMentionChip worldId={worldId} actorId={actorId} fallbackName={fallbackName} />
								) : null}
								{eventId ? (
									<EventMentionChip worldId={worldId} eventId={eventId} fallbackName={fallbackName} />
								) : null}
								{articleId ? (
									<ArticleMentionChip worldId={worldId} articleId={articleId} fallbackName={fallbackName} />
								) : null}
								{tagId ? (
									<TagMentionChip worldId={worldId} tagId={tagId} fallbackName={fallbackName} />
								) : null}
							</CustomThemeProvider>
						</ReduxProvider>
					)
				}

				root.render(<Component />)
			}

			requestIdleCallback(
				() => {
					root = createRoot(dom!)
					rerender(initialNode)
				},
				{ timeout: 100 },
			)
			dispatchGlobalEvent['richEditor/mentionRender/onStart']({ node: initialNode })

			return {
				dom,
				update: (node) => {
					dispatchGlobalEvent['richEditor/mentionRender/onEnd']({ node: lastNode })
					lastNode = node
					dispatchGlobalEvent['richEditor/mentionRender/onStart']({ node })
					rerender(node)
					return true
				},
				destroy: () => {
					dispatchGlobalEvent['richEditor/mentionRender/onEnd']({ node: lastNode })
					requestIdleCallback(() => {
						root?.unmount()
						dispatchGlobalEvent['richEditor/mentionRender/onEnd']({ node: lastNode })
					})
				},
			}
		}
	},
})
