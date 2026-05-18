import { createTiptapExtensionSchema } from '@neverkin/tiptap-schema'
import { getSchema } from '@tiptap/core'
import { generateHTML, generateJSON } from '@tiptap/html'
import { prosemirrorJSONToYXmlFragment, yXmlFragmentToProseMirrorRootNode } from '@tiptap/y-tiptap'
import * as Y from 'yjs'

const extensions = createTiptapExtensionSchema()
const schema = getSchema(extensions)

export function htmlToYDoc(html: string, doc: Y.Doc): void {
	const json = generateJSON(html, extensions)
	prosemirrorJSONToYXmlFragment(schema, json, doc.getXmlFragment('default'))
}

export function yDocToHtml(doc: Y.Doc): string {
	const node = yXmlFragmentToProseMirrorRootNode(doc.getXmlFragment('default'), schema)
	return generateHTML(node.toJSON(), extensions)
}
