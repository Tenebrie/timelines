import { Container, Stack } from '@mui/material'

import { BlockingSpinner } from '../../components/BlockingSpinner'
import { ShareWorldModal } from '../worldSettings/components/ShareWorldModal'
import { DeleteWorldModal } from './components/DeleteWorldModal'
import { WorldWizardModal } from './components/WorldWizard/WorldWizardModal'
import { useWorldListData } from './hooks/useWorldListData'
import { WorldListSection } from './WorldListSection'

export const WorldList = () => {
	const { isFetching, isReady, ownedWorlds, contributableWorlds, visibleWorlds } = useWorldListData()

	return (
		<Container style={{ position: 'relative' }}>
			{isReady && (
				<Stack gap={4}>
					<WorldListSection
						worlds={ownedWorlds}
						label="Your worlds"
						showCreateButton
						showEmptyState
						showActions
					/>
					<WorldListSection worlds={contributableWorlds} label="Shared worlds" />
					<WorldListSection worlds={visibleWorlds} label="Guest worlds" />
				</Stack>
			)}
			<BlockingSpinner visible={isFetching} />
			<WorldWizardModal />
			<ShareWorldModal />
			<DeleteWorldModal />
		</Container>
	)
}
