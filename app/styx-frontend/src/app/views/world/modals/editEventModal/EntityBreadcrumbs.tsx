import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { useBreadcrumbEntities } from './hooks/useBreadcrumbEntities'

type EntityBreadcrumbsProps = {
	entityStack: string[]
	onBreadcrumbClick: (index: number) => void
}

export function EntityBreadcrumbs({ entityStack, onBreadcrumbClick }: EntityBreadcrumbsProps) {
	const breadcrumbEntities = useBreadcrumbEntities(entityStack)

	if (breadcrumbEntities.length <= 1) {
		return null
	}

	return (
		<Breadcrumbs
			separator={<NavigateNextIcon fontSize="small" />}
			aria-label="entity navigation"
			sx={{
				py: 1,
				px: 2,
				backgroundColor: (theme) => theme.palette.action.hover,
				borderRadius: 1,
				'& .MuiBreadcrumbs-separator': {
					mx: 0.5,
				},
			}}
		>
			{breadcrumbEntities.slice(0, -1).map((entity, index) => (
				<Link
					key={entity.id}
					component="button"
					underline="hover"
					color="inherit"
					onClick={() => onBreadcrumbClick(index)}
					sx={{
						cursor: 'pointer',
						fontSize: '0.875rem',
						fontWeight: 500,
						'&:hover': {
							color: 'primary.main',
						},
					}}
				>
					{entity.name}
				</Link>
			))}
			<Typography
				color="text.primary"
				sx={{
					fontSize: '0.875rem',
					fontWeight: 600,
				}}
			>
				{breadcrumbEntities[breadcrumbEntities.length - 1]?.name}
			</Typography>
		</Breadcrumbs>
	)
}
