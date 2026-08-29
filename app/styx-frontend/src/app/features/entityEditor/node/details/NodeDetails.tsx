import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import useEvent from 'react-use-event-hook'

import { MindmapNode } from '@/api/types/mindmapTypes'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { useUpdateMindmapNode } from '@/app/views/world/views/mindmap/api/useUpdateMindmapNode'
import { EditableTitle } from '@/ui-lib/components/EditableTitle/EditableTitle'

import { NodeDescription } from './NodeDescription'

type Props = {
	node: MindmapNode
	titleProps?: Partial<Parameters<typeof EditableTitle>[0]>
	surface?: string
}

export const NodeDetails = ({ node, titleProps, surface }: Props) => {
	const [updateMindmapNode] = useUpdateMindmapNode()

	const onSave = useEvent((name: string) => {
		updateMindmapNode(node.id, { name })
	})

	const scrollbars = useBrowserSpecificScrollbars()

	return (
		<Stack
			gap={1}
			sx={{
				height: 'calc(100% - 1px)',
				...scrollbars,
			}}
		>
			<EditableTitle value={node.name} onSave={onSave} {...titleProps} />
			<Divider />
			<Box flexGrow={1} height={0}>
				<NodeDescription node={node} surface={surface} />
			</Box>
		</Stack>
	)
}
