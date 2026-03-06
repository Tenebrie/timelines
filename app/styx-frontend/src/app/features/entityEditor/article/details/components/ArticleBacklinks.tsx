import { useGetArticleBacklinksQuery } from '@api/otherApi'
import { useSelector } from 'react-redux'

import { EntityBacklinks } from '@/app/features/entityEditor/common/EntityBacklinks'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

type Props = {
	articleId: string
}

export const ArticleBacklinks = ({ articleId }: Props) => {
	const { id: worldId } = useSelector(getWorldState, (a, b) => a.id === b.id)

	const { data, isLoading } = useGetArticleBacklinksQuery(
		{ worldId, articleId },
		{ refetchOnMountOrArgChange: true },
	)

	return <EntityBacklinks mentions={data ?? []} isLoading={isLoading} />
}
