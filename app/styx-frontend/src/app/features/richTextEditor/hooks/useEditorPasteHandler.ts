import { base64ToFile } from '@api/hooks/fileUpload/base64ToFile'
import { useFileUpload } from '@api/hooks/fileUpload/useFileUpload'
import { Fragment, Node, Slice } from '@tiptap/pm/model'
import { EditorView } from '@tiptap/pm/view'
import { useCallback } from 'react'
import { v4 as getRandomId } from 'uuid'

import { mapProseMirrorSlice } from '../utils/mapProseMirrorSlice'

export function useEditorPasteHandler() {
	const { uploadFile } = useFileUpload()

	function getReadableTimestamp() {
		return new Date().toISOString().slice(0, 19).replace('T', ' ')
	}

	const handlePaste = useCallback(
		(view: EditorView, event: ClipboardEvent, baseSlice: Slice) => {
			const uploadingFiles: {
				uploadId: string
				file: Promise<File>
			}[] = []

			let slice: Slice = baseSlice

			// Pasted files, likely from the OS (screenshots)
			if (baseSlice.size === 0 && event.clipboardData?.files?.length) {
				const fragments: Node[] = []
				const files = [...event.clipboardData.files]
				files.forEach((file) => {
					const uploadId = getRandomId()
					uploadingFiles.push({
						uploadId,
						file: new Promise((resolve) => resolve(file)),
					})
					const node = view.state.schema.nodes['externalImageNode'].createAndFill({
						src: null,
						uploadId,
					})!
					fragments.push(node)
				})

				slice = new Slice(Fragment.fromArray(fragments), 0, 0)
			}

			// Pre-parsed slice, likely HTML content from elsewhere
			const cleanedSlice = mapProseMirrorSlice(slice, (node) => {
				if (node.type.name === 'externalImageNode' && node.attrs.src?.startsWith('data:')) {
					const uploadId = getRandomId()
					uploadingFiles.push({
						uploadId,
						file: base64ToFile(node.attrs.src, `Embedded Image ${getReadableTimestamp()}`),
					})
					return node.type.create({ ...node.attrs, src: null, uploadId }, node.content, node.marks)
				}
				return null
			})

			view.dispatch(view.state.tr.replaceSelection(cleanedSlice))

			if (uploadingFiles.length === 0) {
				return true
			}

			async function processPaste() {
				uploadingFiles.forEach(async ({ file, uploadId }) => {
					const fileHandle = await file
					const response = await uploadFile(fileHandle, 'ImageEmbed')

					let foundPos = -1
					view.state.doc.descendants((node, pos) => {
						if (node.type.name === 'externalImageNode' && node.attrs.uploadId === uploadId) {
							foundPos = pos
							return false
						}
					})
					if (foundPos < 0) {
						return
					}

					const currentNode = view.state.doc.nodeAt(foundPos)
					if (!currentNode) {
						return
					}

					view.dispatch(
						view.state.tr.setNodeMarkup(foundPos, undefined, {
							...currentNode.attrs,
							assetId: response.id,
							uploadId: null,
							externalImageProps: {
								...currentNode.attrs.externalImageProps,
								sizeX: response.imageWidth,
								sizeY: response.imageHeight,
							},
						}),
					)
				})
			}
			processPaste()
			return true
		},
		[uploadFile],
	)

	return { handlePaste }
}
