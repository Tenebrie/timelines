import { WorldTag } from '@api/types/worldTypes'
import Stack from '@mui/material/Stack'
import { memo } from 'react'

import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'

import { TagMentionedBy } from './components/TagMentionedBy'
import { TagTitle } from './components/TagTitle'
import { useTagDraft } from './draft/useTagDraft'
import { useUpdateTag } from './draft/useUpdateTag'

type Props = {
	editedTag: WorldTag
}

export const TagDetails = memo(TagDetailsComponent)

export function TagDetailsComponent({ editedTag }: Props) {
	const draft = useTagDraft({ tag: editedTag })

	useUpdateTag({ draft })

	return (
		<Stack
			gap={2}
			sx={{
				height: '100%',
				...useBrowserSpecificScrollbars(),
			}}
		>
			<TagTitle draft={draft} />
			<TagMentionedBy tagId={editedTag.id} />
		</Stack>
	)
}
