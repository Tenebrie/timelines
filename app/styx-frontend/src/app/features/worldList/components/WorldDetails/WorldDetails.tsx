import { useSelector } from 'react-redux'

import { getWorldIdState } from '@/app/features/world/selectors'

import { WorldDetailsEditorWrapper } from './WorldDetailsEditorWrapper'

export const WorldDetails = () => {
	const worldId = useSelector(getWorldIdState)

	return <WorldDetailsEditorWrapper worldId={worldId} key={worldId} />
}
