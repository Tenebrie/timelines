import { useGetTagDetailsQuery } from '@api/worldTagApi'
import { useSelector } from 'react-redux'

import { EntityBacklinks } from '@/app/features/entityEditor/common/EntityBacklinks'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

type Props = {
	tagId: string
}

export const TagMentionedBy = ({ tagId }: Props) => {
	const { id: worldId } = useSelector(getWorldState, (a, b) => a.id === b.id)

	const { data, isLoading } = useGetTagDetailsQuery({ worldId, tagId }, { refetchOnMountOrArgChange: true })

	return <EntityBacklinks mentions={data?.mentionedBy ?? []} isLoading={isLoading} />
}
