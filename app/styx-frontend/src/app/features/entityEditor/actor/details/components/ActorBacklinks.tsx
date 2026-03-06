import { useGetActorBacklinksQuery } from '@api/actorListApi'
import { useSelector } from 'react-redux'

import { EntityBacklinks } from '@/app/features/entityEditor/common/EntityBacklinks'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

type Props = {
	actorId: string
}

export const ActorBacklinks = ({ actorId }: Props) => {
	const { id: worldId } = useSelector(getWorldState, (a, b) => a.id === b.id)

	const { data, isLoading } = useGetActorBacklinksQuery(
		{ worldId, actorId },
		{ refetchOnMountOrArgChange: true },
	)

	return <EntityBacklinks mentions={data ?? []} isLoading={isLoading} />
}
