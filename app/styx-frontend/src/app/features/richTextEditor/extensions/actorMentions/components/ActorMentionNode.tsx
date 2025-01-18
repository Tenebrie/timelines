import { Node } from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { createRoot, Root } from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'

import { CustomThemeProvider } from '@/app/features/theming/CustomThemeProvider'
import { store } from '@/app/store'

import { MentionChipInternal } from './ActorMentionChip'

export const ActorMentionNodeName = 'mentionChip'

const getActorName = (node: ProseMirrorNode) => {
	const actorId = node.attrs.componentProps.actor as string
	const name = store.getState().world.actors.find((actor) => actor.id === actorId)?.name ?? 'Unknown'
	return name
}

export const MentionChip = Node.create({
	name: ActorMentionNodeName,

	group: 'inline',
	inline: true,
	atom: true,

	addAttributes() {
		return {
			componentProps: {
				default: {
					actor: null,
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
		return `${getActorName(node)}`
	},

	// addKeyboardShortcuts() {
	// 	return {
	// 		Backspace: ({ editor }) => {
	// 			const { state, dispatch } = editor.view
	// 			const { selection } = state
	// 			const { $from } = selection

	// 			// Check if the cursor is directly after the node
	// 			const nodeBefore = $from.nodeBefore
	// 			if (nodeBefore && nodeBefore.type.name === this.name) {
	// 				const pos = $from.pos - nodeBefore.nodeSize

	// 				// Replace the node with plain text
	// 				const transaction = state.tr.replaceWith(
	// 					pos,
	// 					$from.pos,
	// 					editor.schema.text(`@${getActorName(nodeBefore)}`),
	// 				)

	// 				dispatch(transaction)
	// 				return true // Prevent default backspace behavior
	// 			}

	// 			return false // Allow default behavior otherwise
	// 		},
	// 	}
	// },

	addNodeView() {
		return ({ node }) => {
			const dom = document.createElement('span')

			let root: Root | null = null

			setTimeout(() => {
				root = createRoot(dom)
				const actorId = node.attrs.componentProps.actor as string
				root.render(
					<ReduxProvider store={store}>
						<CustomThemeProvider>
							<MentionChipInternal actorId={actorId} />
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
