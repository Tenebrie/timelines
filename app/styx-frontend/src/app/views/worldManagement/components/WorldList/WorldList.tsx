import Stack from '@mui/material/Stack'

import { WorldListEmptyState } from '@/app/views/worldManagement/components/WorldListEmptyState'
import { DeleteWorldModal } from '@/app/views/worldManagement/modals/DeleteWorldModal'
import { WorldWizardModal } from '@/app/views/worldManagement/modals/WorldWizardModal'

import { useWorldListData } from '../../hooks/useWorldListData'
import { WorldListSection } from './WorldListSection'

export const WorldList = () => {
	const { isReady, ownedWorlds, contributableWorlds, visibleWorlds } = useWorldListData()

	return (
		<>
			<Stack gap={3}>
				{ownedWorlds.length === 0 && isReady && <WorldListEmptyState label="Your Worlds" />}
				{ownedWorlds.length > 0 && (
					<WorldListSection worlds={ownedWorlds} label="Your Worlds" showCreateButton showActions />
				)}
				{contributableWorlds.length > 0 && (
					<WorldListSection worlds={contributableWorlds} label="Shared Worlds (Contributor)" />
				)}
				{visibleWorlds.length > 0 && (
					<WorldListSection worlds={visibleWorlds} label="Shared Worlds (Reader)" />
				)}
			</Stack>
			<WorldWizardModal />
			<DeleteWorldModal />
		</>
	)
}
