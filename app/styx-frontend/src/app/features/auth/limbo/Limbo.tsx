import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Navigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { useCheckAuthenticationQuery } from '@/api/authApi'
import { BlockingSpinner } from '@/app/components/BlockingSpinner'
import { useErrorState } from '@/app/utils/useErrorState'

import { LimboPageContainer } from './styles'

export const Limbo = () => {
	const { data, isError, refetch, isFetching } = useCheckAuthenticationQuery()

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
	}, [data, isError, raiseError])

	if (data && data.authenticated) {
		return <Navigate to={'/home'} />
	} else if (data && !data.authenticated) {
		return <Navigate to={'/login'} />
	}

	return (
		<LimboPageContainer>
			<Typography variant="h1">Limbo</Typography>
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
