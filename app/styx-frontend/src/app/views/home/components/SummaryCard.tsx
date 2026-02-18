import ArrowForward from '@mui/icons-material/ArrowForward'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

type SummaryCardProps = {
	icon: ReactNode
	title: string
	items: { label: string; count: number }[]
	onClick: () => void
}

export function SummaryCard({ icon, title, items, onClick }: SummaryCardProps) {
	const total = items.reduce((sum, item) => sum + item.count, 0)

	return (
		<ButtonBase
			onClick={onClick}
			sx={{
				flex: 1,
				textAlign: 'left',
				borderRadius: 2,
				height: '100%',
			}}
			aria-label={`${title} card`}
		>
			<Paper
				elevation={2}
				sx={{
					p: 3,
					borderRadius: 2,
					width: '100%',
					transition: 'transform 0.2s, box-shadow 0.2s',
					'&:hover': {
						transform: 'translateY(-2px)',
						boxShadow: 4,
					},
				}}
			>
				<Stack direction="row" alignItems="center" gap={2} mb={2}>
					<Box
						sx={{
							p: 1.5,
							borderRadius: 2,
							bgcolor: 'primary.main',
							color: 'primary.contrastText',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{icon}
					</Box>
					<Box flex={1}>
						<Typography variant="h4" fontWeight="bold">
							{total}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{title}
						</Typography>
					</Box>
					<ArrowForward sx={{ color: 'text.secondary' }} />
				</Stack>
				<Divider sx={{ my: 1.5 }} />
				<Stack gap={0.5}>
					{items.map((item) => (
						<Stack key={item.label} direction="row" justifyContent="space-between">
							<Typography variant="body2" color="text.secondary">
								{item.label}
							</Typography>
							<Typography variant="body2" fontWeight="medium">
								{item.count}
							</Typography>
						</Stack>
					))}
				</Stack>
			</Paper>
		</ButtonBase>
	)
}
