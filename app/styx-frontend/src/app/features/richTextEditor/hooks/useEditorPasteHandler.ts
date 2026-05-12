import { base64ToFile } from '@api/hooks/fileUpload/base64ToFile'
import { useFileUpload } from '@api/hooks/fileUpload/useFileUpload'
import { Slice } from '@tiptap/pm/model'
import { EditorView } from '@tiptap/pm/view'
import { useCallback } from 'react'

import { mapProseMirrorSlice } from '../utils/mapProseMirrorSlice'

export function useEditorPasteHandler() {
	const { uploadFile } = useFileUpload()

	function getReadableTimestamp() {
		return new Date().toISOString().slice(0, 19).replace('T', ' ')
	}

	const handlePaste = useCallback(
		(view: EditorView, event: ClipboardEvent, slice: Slice) => {
			const uploadingFiles: {
				file: Promise<File>
				nodeOffset: number
				nodeSize: number
			}[] = []
			const insertionStart = view.state.selection.from - slice.openStart
			const cleanedSlice = mapProseMirrorSlice(slice, (node, offset) => {
				if (node.type.name === 'externalImageNode' && node.attrs.src?.startsWith('data:')) {
					uploadingFiles.push({
						file: base64ToFile(node.attrs.src, `Embedded Image ${getReadableTimestamp()}`),
						nodeOffset: offset + insertionStart,
						nodeSize: node.nodeSize,
					})
					return node.type.create({ ...node.attrs, src: null }, node.content, node.marks)
				}
				return null
			})

			view.dispatch(view.state.tr.replaceSelection(cleanedSlice))

			if (uploadingFiles.length === 0) {
				return true
			}

			async function processPaste() {
				uploadingFiles.forEach(async ({ file, nodeOffset, nodeSize }) => {
					const fileHandle = await file
					const currentNode = view.state.doc.nodeAt(nodeOffset)
					if (!currentNode) {
						return
					}
					const response = await uploadFile(fileHandle, 'ImageEmbed')
					const transaction = view.state.tr.setNodeMarkup(nodeOffset, undefined, {
						...currentNode.attrs,
						assetId: response.id,
					})
					view.dispatch(transaction)
				})
			}
			processPaste()
			return true
		},
		[uploadFile],
	)

	return { handlePaste }
}
