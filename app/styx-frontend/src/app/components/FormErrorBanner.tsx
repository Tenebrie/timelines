import Close from '@mui/icons-material/Close'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import { ReactNode } from 'react'
import { TransitionGroup } from 'react-transition-group'

type Props = {
	marginBottom?: number
	errorState: {
		clearError: () => void
		error: {
			data: ReactNode
		} | null
	}
}

export const FormErrorBanner = ({ errorState, marginBottom }: Props) => {
	const { error, clearError } = errorState

	return (
		<TransitionGroup style={{ marginBottom: -(marginBottom ?? 16) }}>
			{error && (
				<Collapse>
					<Alert
						sx={{
							marginBottom: marginBottom ?? '16px',
							'& > .MuiAlert-action': { paddingTop: 0 },
						}}
						severity="error"
						action={
							<IconButton size="small" onClick={clearError}>
								<Close fontSize="small" />
							</IconButton>
						}
					>
						{error.data}
					</Alert>
				</Collapse>
			)}
		</TransitionGroup>
	)
}
