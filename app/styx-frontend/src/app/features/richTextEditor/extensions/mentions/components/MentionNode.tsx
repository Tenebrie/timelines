import { Node } from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { createRoot, Root } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'

import { CustomThemeProvider } from '@/app/features/theming/CustomThemeProvider'
import { store } from '@/app/store'

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
		return ({ node }) => {
			const dom = document.createElement('span')

			let root: Root | null = null

			setTimeout(() => {
				root = createRoot(dom)
				const actorId = node.attrs.componentProps.actor as string | undefined
				const eventId = node.attrs.componentProps.event as string | undefined
				const articleId = node.attrs.componentProps.article as string | undefined
				root.render(
					<ReduxProvider store={store}>
						<CustomThemeProvider>
							{actorId ? <ActorMentionChip actorId={actorId} /> : null}
							{eventId ? <EventMentionChip eventId={eventId} /> : null}
							{articleId ? <ArticleMentionChip articleId={articleId} /> : null}
						</CustomThemeProvider>
					</ReduxProvider>,
				)
			})

			return {
				dom,
				update: () => true,
				destroy: () => {
					setTimeout(() => {
						root?.unmount()
					})
				},
			}
		}
	},
})
