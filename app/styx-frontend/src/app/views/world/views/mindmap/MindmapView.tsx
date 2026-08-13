import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import { OutlinerDrawer } from '../../components/OutlinerDrawer'
import { Mindmap } from './Mindmap'

export const MindmapView = () => {
	return (
		<Stack direction="row" sx={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
			<Box width={1} height={1} position="relative" overflow="auto">
				<Mindmap />
			</Box>
			<OutlinerDrawer />
		</Stack>
	)
}

/**
 * TODO: Migrate to the new outliner design
 */

// export const MindmapView = () => {
// 	return (
// 		<Stack direction="row" sx={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
// 			<WikiOutlinerDrawer>
// 				<Stack
// 					sx={{
// 						width: '100%',
// 						minWidth: 0,
// 						height: '100%',
// 					}}
// 					data-testid="ArticleListWithHeader"
// 				>
// 					<Stack gap={1} height={1}>
// 						<Stack gap={1}>
// 							<ArticleListHeader />
// 							<Divider />
// 							<ArticleListEntityGroupButton />
// 						</Stack>
// 						<ArticleList parentId={null} depth={0} />
// 					</Stack>
// 				</Stack>
// 			</WikiOutlinerDrawer>
// 			<Box width={1} height={1} position="relative" overflow="auto">
// 				<Mindmap />
// 			</Box>
// 		</Stack>
// 	)
// }
