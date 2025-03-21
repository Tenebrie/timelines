import Close from '@mui/icons-material/Close'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import { TransitionGroup } from 'react-transition-group'

import { parseApiError } from '../utils/parseApiError'

type Props = {
	marginBottom?: number
	apiState: {
		isError: boolean
		error?: unknown
		reset: () => void
	}
}

export const ApiErrorBanner = ({ apiState, marginBottom }: Props) => {
	return (
		<TransitionGroup style={{ marginBottom: -(marginBottom ?? 16) }}>
			{apiState.isError && (
				<Collapse>
					<Alert
						sx={{
							marginBottom: marginBottom ?? '16px',
							'& > .MuiAlert-action': { paddingTop: 0 },
						}}
						severity="error"
						action={
							<IconButton size="small" onClick={apiState.reset}>
								<Close fontSize="small" />
							</IconButton>
						}
					>
						{parseApiError(apiState.error).message}
					</Alert>
				</Collapse>
			)}
		</TransitionGroup>
	)
}
