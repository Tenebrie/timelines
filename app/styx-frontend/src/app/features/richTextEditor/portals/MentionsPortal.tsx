import { Node as ProseMirrorNode } from '@tiptap/pm/model'

const mentions = []

export const requestMentionsRender = (renderFunc: (node: ProseMirrorNode) => void) => {}

export const MentionsPortal = () => {
	return <div></div>
}
