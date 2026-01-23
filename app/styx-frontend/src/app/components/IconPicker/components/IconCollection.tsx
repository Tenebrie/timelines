import type { IconCollection as IconCollectionData } from '@api/types/iconTypes'
import { Icon } from '@iconify/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'

import { FavoriteIconCollectionButton } from './FavoriteIconCollectionButton'

type Props = {
	collection: IconCollectionData
	color: string
	onSelect: (icon: string) => void
}

export const IconCollection = memo(IconCollectionComponent)

function IconCollectionComponent({ collection, color, onSelect }: Props) {
	const targetLink = useMemo(() => {
		return `https://icon-sets.iconify.design/${collection.id}/`
	}, [collection])

	// Defer the icon rendering to not block the UI
	const deferredIcons = useDeferredValue(collection.icons)

	// Track if this collection is visible using intersection observer
	const [isVisible, setIsVisible] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	// Lazy load icons when collection becomes visible
	useEffect(() => {
		if (!containerRef.current) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setIsVisible(true)
					observer.disconnect()
				}
			},
			{ rootMargin: '100px' },
		)

		observer.observe(containerRef.current)

		return () => observer.disconnect()
	}, [])

	return (
		<div ref={containerRef}>
			<Typography variant="h6">
				{collection.procedural && <span>{collection.name}</span>}
				{!collection.procedural && (
					<Link href={targetLink} underline="hover">
						{collection.name}
					</Link>
				)}
				<FavoriteIconCollectionButton collection={collection} />
			</Typography>
			<Stack direction="row" flexWrap="wrap" gap={1}>
				{isVisible &&
					deferredIcons.map((icon, index) => (
						<Button key={index} onClick={() => onSelect(icon)} sx={{ padding: 0.25, minWidth: 'auto' }}>
							<Tooltip title={icon} disableInteractive>
								<Box
									sx={{
										width: 36,
										height: 36,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Icon color={color} icon={icon} width={36} height={36} ssr />
								</Box>
							</Tooltip>
						</Button>
					))}
			</Stack>
		</div>
	)
}
