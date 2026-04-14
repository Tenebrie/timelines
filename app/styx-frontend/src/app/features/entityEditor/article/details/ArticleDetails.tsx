import { WikiArticle } from '@api/types/worldWikiTypes'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'

import { EntityEditorTabs } from '../../common/EntityEditorTabs'
import { ArticleDescription } from './ArticleDescription'
import { ArticleTitle } from './ArticleTitle'
import { ArticleBacklinks } from './components/ArticleBacklinks'

type Props = {
	article: WikiArticle
}

export const ArticleDetails = ({ article }: Props) => {
	const scrollbars = useBrowserSpecificScrollbars()

	return (
		<Stack
			gap={1}
			sx={{
				height: 'calc(100% - 1px)',
				...scrollbars,
			}}
		>
			<ArticleTitle article={article} />
			<Box flexGrow={1} height={0}>
				<EntityEditorTabs
					contentTab={<ArticleDescription article={article} />}
					backlinksTab={<ArticleBacklinks articleId={article.id} />}
				/>
			</Box>
		</Stack>
	)
}
