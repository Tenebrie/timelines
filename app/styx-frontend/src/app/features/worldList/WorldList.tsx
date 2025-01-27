import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'

import { BlockingSpinner } from '../../components/BlockingSpinner'
import { DeleteWorldModal } from './components/DeleteWorldModal'
import { WorldWizardModal } from './components/WorldWizard/WorldWizardModal'
import { useWorldListData } from './hooks/useWorldListData'
import { WorldListSection } from './WorldListSection'

export const WorldList = () => {
	const { isFetching, isReady, ownedWorlds, contributableWorlds, visibleWorlds } = useWorldListData()

	return (
		<Container style={{ position: 'relative', minWidth: 512 }}>
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
			<DeleteWorldModal />
		</Container>
	)
}
