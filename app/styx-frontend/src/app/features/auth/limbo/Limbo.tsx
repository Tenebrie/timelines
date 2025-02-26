import { BlockingSpinner } from '@/app/features/skeleton/BlockingSpinner'

import { LimboPageContainer } from './styles'

export const Limbo = () => {
	return (
		<LimboPageContainer>
			<BlockingSpinner visible />
		</LimboPageContainer>
	)
}
