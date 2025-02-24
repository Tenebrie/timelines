import { BlockingSpinner } from '@/app/components/BlockingSpinner'

import { LimboPageContainer } from './styles'

export const Limbo = () => {
	return (
		<LimboPageContainer>
			<BlockingSpinner visible />
		</LimboPageContainer>
	)
}
