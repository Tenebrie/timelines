import { Button, Link, Stack, Typography } from '@mui/material'
import { useEffect } from 'react'

import { useCheckAuthenticationQuery } from '../../../../api/rheaApi'
import { BlockingSpinner } from '../../../components/BlockingSpinner'
import { useErrorState } from '../../../utils/useErrorState'
import { useAppRouter } from '../../world/router'
import { LimboPageContainer } from './styles'

export const Limbo = () => {
	const { data, isError, refetch, isFetching } = useCheckAuthenticationQuery()
	const { navigateToHomeWithoutHistory, navigateToLoginWithoutHistory } = useAppRouter()

	const { error, raiseError } = useErrorState<{
		WRONG_PORT: null
		NO_SERVER_CONNECTION: string
	}>()

	useEffect(() => {
		if (isError && window.location.hostname === 'localhost' && window.location.port === '8080') {
			raiseError('WRONG_PORT', null)
			return
		} else if (isError) {
			raiseError('NO_SERVER_CONNECTION', 'Unable to reach server. Please try again later.')
			return
		}

		if (!data) {
			return
		}

		if (data.authenticated) {
			navigateToHomeWithoutHistory()
		} else {
			navigateToLoginWithoutHistory()
		}
	}, [data, isError, navigateToHomeWithoutHistory, navigateToLoginWithoutHistory, raiseError])

	return (
		<LimboPageContainer>
			<BlockingSpinner visible={isFetching} />
			{error && error.type === 'WRONG_PORT' && (
				<Stack gap={1}>
					<Typography variant="body1">
						Unable to reach server. Try accessing <Link href="http://localhost/">http://localhost/</Link>{' '}
						instead.
					</Typography>
					<Button variant="outlined" onClick={refetch}>
						Retry
					</Button>
				</Stack>
			)}
			{error && error.type === 'NO_SERVER_CONNECTION' && (
				<Stack gap={1}>
					<Typography variant="body1">{error.data}</Typography>
					<Button variant="outlined" onClick={refetch}>
						Retry
					</Button>
				</Stack>
			)}
		</LimboPageContainer>
	)
}
