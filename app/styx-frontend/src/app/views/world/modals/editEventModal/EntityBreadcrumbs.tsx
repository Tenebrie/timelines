import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useSelector } from 'react-redux'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { useBreadcrumbEntities } from './hooks/useBreadcrumbEntities'

type EntityBreadcrumbsProps = {
	entityStack: string[]
	onBreadcrumbClick: (index: number) => void
	onWorldClick: () => void
	onClose: () => void
}

export function EntityBreadcrumbs({
	entityStack,
	onBreadcrumbClick,
	onWorldClick,
	onClose,
}: EntityBreadcrumbsProps) {
	const breadcrumbEntities = useBreadcrumbEntities(entityStack)
	const { name: worldName } = useSelector(getWorldState)
	const { creatingNew } = useModal('editEventModal')

	// Determine if we're in a nested view (show back arrow) or at root (show close X)
	const isNested = entityStack.length > 1
	const ButtonIcon = isNested ? ArrowBackIcon : CloseIcon
	const buttonLabel = isNested ? 'go back' : 'close'

	// Determine the current item name
	const currentItemName = (() => {
		if (creatingNew === 'event') {
			return 'New event'
		}
		if (creatingNew === 'actor') {
			return 'New actor'
		}
		return breadcrumbEntities[breadcrumbEntities.length - 1]?.name || 'Loading...'
	})()

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: 1,
				py: 0.75,
				pb: 1,
				borderBottom: 1,
				borderColor: 'divider',
			}}
		>
			<Breadcrumbs
				separator={<NavigateNextIcon fontSize="small" />}
				aria-label="entity navigation"
				sx={{
					display: 'flex',
					alignItems: 'center',
					'& .MuiBreadcrumbs-separator': {
						mx: 0.5,
						display: 'flex',
						alignItems: 'center',
						color: 'text.secondary',
					},
					'& .MuiBreadcrumbs-ol': {
						alignItems: 'center',
					},
				}}
			>
				<Link
					component="button"
					underline="hover"
					color="inherit"
					onClick={onWorldClick}
					sx={{
						cursor: 'pointer',
						fontSize: '0.875rem',
						fontWeight: 400,
						display: 'flex',
						alignItems: 'center',
						color: 'text.secondary',
						'&:hover': {
							color: 'primary.main',
						},
					}}
				>
					{worldName}
				</Link>
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
							fontWeight: 400,
							display: 'flex',
							alignItems: 'center',
							color: 'text.secondary',
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
						fontWeight: 500,
						display: 'flex',
						alignItems: 'center',
					}}
				>
					{currentItemName}
				</Typography>
			</Breadcrumbs>
			<IconButton
				onClick={onClose}
				size="small"
				aria-label={buttonLabel}
				sx={{
					padding: 0.75,
					margin: -0.75,
					color: 'text.secondary',
					'&:hover': {
						color: 'text.primary',
					},
				}}
			>
				<ButtonIcon fontSize="small" />
			</IconButton>
		</Box>
	)
}
