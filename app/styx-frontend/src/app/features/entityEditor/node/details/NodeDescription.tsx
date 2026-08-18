import { MindmapNode } from '@api/types/mindmapTypes'
import Box from '@mui/material/Box'
import debounce from 'lodash.debounce'
import { useCallback, useRef } from 'react'

import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { useUpdateMindmapNode } from '@/app/views/world/views/mindmap/api/useUpdateMindmapNode'

type Props = {
	node: MindmapNode
	surface?: string
}

export const NodeDescription = ({ node, surface }: Props) => {
	const [, , updateCachedNode] = useUpdateMindmapNode()

	// Content is persisted by the collaboration pipeline; this only keeps the mindmap card preview current.
	const debouncedUpdate = useRef(
		debounce((nodeId: string, content: string, contentRich: string) => {
			updateCachedNode(nodeId, { content, contentRich })
		}, 2000),
	)

	const scrollbars = useBrowserSpecificScrollbars()

	const handleChange = useCallback(
		({ plainText, richText }: { plainText: string; richText: string }) => {
			debouncedUpdate.current(node.id, plainText, richText)
		},
		[node.id],
	)

	return (
		<Box sx={{ ...scrollbars, height: '100%' }}>
			<RichTextEditorSummoner
				value={node.contentRich}
				onChange={handleChange}
				allowReadMode
				surface={surface}
				collaboration={{
					entityType: 'node',
					documentId: node.id,
				}}
			/>
		</Box>
	)
}
