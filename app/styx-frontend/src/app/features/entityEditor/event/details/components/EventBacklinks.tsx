import { useGetWorldEventBacklinksQuery } from '@api/worldEventApi'
import { useSelector } from 'react-redux'

import { EntityBacklinks } from '@/app/features/entityEditor/common/EntityBacklinks'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

type Props = {
	eventId: string
}

export const EventBacklinks = ({ eventId }: Props) => {
	const { id: worldId } = useSelector(getWorldState, (a, b) => a.id === b.id)

	const { data, isLoading } = useGetWorldEventBacklinksQuery(
		{ worldId, eventId },
		{ refetchOnMountOrArgChange: true },
	)

	return <EntityBacklinks mentions={data ?? []} isLoading={isLoading} />
}
