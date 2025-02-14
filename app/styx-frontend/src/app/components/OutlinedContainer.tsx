import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { ReactNode } from 'react'

type Props = {
	label: string
	secondaryLabel?: ReactNode
	children?: ReactNode | ReactNode[]
	style?: React.CSSProperties
	fullHeight?: boolean
	gap?: number
}

export const OutlinedContainer = ({ label, secondaryLabel, children, style, fullHeight, gap }: Props) => {
	return (
		<Stack sx={{ height: '100%', position: 'relative' }}>
			<Paper
				sx={{
					padding: 2,
					paddingTop: 3,
					overflowY: 'auto',
					height: '100%',
					position: 'relative',
					borderRadius: 0,
				}}
				elevation={2}
				style={style}
			>
				<Stack gap={gap ?? 1} sx={{ height: fullHeight ? '100%' : 'unset' }}>
					<Stack gap={1}>
						<Stack width="100%" justifyContent="space-between" direction="row" alignContent="center">
							<Typography variant="h6" marginLeft={1}>
								{label}
							</Typography>
							{secondaryLabel && (
								<Typography variant="body2" marginRight={1} display="flex" alignItems="center">
									{secondaryLabel}
								</Typography>
							)}
						</Stack>
						<Divider />
					</Stack>
					{children}
				</Stack>
			</Paper>
		</Stack>
	)
}
