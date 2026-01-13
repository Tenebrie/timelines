import { Node } from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { createRoot, Root } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'

import { dispatchEvent } from '@/app/features/eventBus'
import { CustomThemeProvider } from '@/app/features/theming/context/CustomThemeProvider'
import { store } from '@/app/store'
import { useEffectOnce } from '@/app/utils/useEffectOnce'

import { ActorMentionChip } from './chips/ActorMentionChip'
import { ArticleMentionChip } from './chips/ArticleMentionChip'
import { EventMentionChip } from './chips/EventMentionChip'

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

export const MentionNode = Node.create({
	name: MentionNodeName,

	group: 'inline',
	inline: true,
	atom: true,

	addAttributes() {
		return {
			componentProps: {
				default: {
					actor: null,
					event: null,
					article: null,
				},
				parseHTML: (element) => {
					return JSON.parse(element.getAttribute('data-component-props') || '{}')
				},
				renderHTML: (attributes) => {
					return {
						'data-component-props': JSON.stringify(attributes.componentProps),
					}
				},
			},
		}
	},

	parseHTML() {
		return [
			{
				tag: 'span',
			},
		]
	},

	renderHTML({ HTMLAttributes }) {
		return ['span', { ...HTMLAttributes }]
	},

	renderText({ node }) {
		return getActorName(node) ?? getEventName(node) ?? getArticleName(node) ?? 'Unknown entity'
	},

	addNodeView() {
		return ({ node: initialNode }) => {
			let root: Root | null = null
			const dom = document.createElement('span')

			let lastNode: ProseMirrorNode = initialNode

			const rerender = (node: ProseMirrorNode) => {
				if (!root) {
					return
				}
				const actorId = node.attrs.componentProps.actor as string | undefined
				const eventId = node.attrs.componentProps.event as string | undefined
				const articleId = node.attrs.componentProps.article as string | undefined
				const state = store.getState()
				const worldId = state.world.id
				const actors = state.world.actors
				const events = state.world.events
				const articles = state.wiki.articles

				const Component = () => {
					useEffectOnce(() => {
						dispatchEvent['richEditor/mentionRender/onEnd']({ node })
					})

					return (
						<ReduxProvider store={store}>
							<CustomThemeProvider colorMode={state.preferences.colorMode}>
								{actorId ? <ActorMentionChip worldId={worldId} actorId={actorId} actors={actors} /> : null}
								{eventId ? <EventMentionChip worldId={worldId} eventId={eventId} events={events} /> : null}
								{articleId ? (
									<ArticleMentionChip worldId={worldId} articleId={articleId} articles={articles} />
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
			dispatchEvent['richEditor/mentionRender/onStart']({ node: initialNode })

			return {
				dom,
				update: (node) => {
					dispatchEvent['richEditor/mentionRender/onEnd']({ node: lastNode })
					lastNode = node
					dispatchEvent['richEditor/mentionRender/onStart']({ node })
					rerender(node)
					return true
				},
				destroy: () => {
					dispatchEvent['richEditor/mentionRender/onEnd']({ node: lastNode })
					requestIdleCallback(() => {
						root?.unmount()
						dispatchEvent['richEditor/mentionRender/onEnd']({ node: lastNode })
					})
				},
			}
		}
	},
})
