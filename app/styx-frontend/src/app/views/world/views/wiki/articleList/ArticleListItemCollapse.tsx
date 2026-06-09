import Stack from '@mui/material/Stack'
import { useSelector } from 'react-redux'

import { ShowHideChevron } from '@/app/components/ShowHideChevron'
import { getWikiPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'

import { BoxedWikiEntity } from '../hooks/useBoxedWikiContent'

type Props = {
	entity: BoxedWikiEntity
}

export function ArticleListItemCollapse({ entity }: Props) {
	const { expandedFolders } = useSelector(
		getWikiPreferences,
		(a, b) => a.expandedFolders === b.expandedFolders,
	)

	const collapsed = !expandedFolders.includes(entity.id)

	return (
		<Stack
			direction="row"
			alignItems="center"
			justifyContent="center"
			sx={{
				marginLeft: -0.5,
				marginRight: 0,
			}}
		>
			<ShowHideChevron collapsed={collapsed} />
		</Stack>
	)
}
