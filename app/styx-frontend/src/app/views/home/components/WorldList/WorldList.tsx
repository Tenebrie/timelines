import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'

import { ContainedSpinner } from '@/app/features/skeleton/ContainedSpinner'
import { WorldListEmptyState } from '@/app/views/home/components/WorldListEmptyState'
import { DeleteWorldModal } from '@/app/views/home/modals/DeleteWorldModal'
import { WorldWizardModal } from '@/app/views/home/modals/WorldWizardModal'

import { useWorldListData } from '../../hooks/useWorldListData'
import { WorldListSection } from './WorldListSection'

export const WorldList = () => {
	const { isFetching, isReady, ownedWorlds, contributableWorlds, visibleWorlds } = useWorldListData()

	return (
		<Container style={{ minWidth: 512 }}>
			<Stack gap={2} position="relative">
				{ownedWorlds.length === 0 && isReady && <WorldListEmptyState label="Your worlds" />}
				{ownedWorlds.length > 0 && (
					<WorldListSection worlds={ownedWorlds} label="Your worlds" showCreateButton showActions />
				)}
				{contributableWorlds.length > 0 && (
					<WorldListSection worlds={contributableWorlds} label="Shared worlds" />
				)}
				{visibleWorlds.length > 0 && <WorldListSection worlds={visibleWorlds} label="Guest worlds" />}
				<ContainedSpinner visible={isFetching} />
			</Stack>
			<WorldWizardModal />
			<DeleteWorldModal />
		</Container>
	)
}
