import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useRef, useState } from 'react'

type ReferenceImage = {
	base64: string
	mimeType: string
	name: string
}

type Props = {
	referenceImages: ReferenceImage[]
	onReferenceImagesChange: (images: ReferenceImage[]) => void
	disabledReason?: string
}

const MAX_REFERENCE_IMAGES = 3
const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB

export function ReferenceImagePicker({ referenceImages, onReferenceImagesChange, disabledReason }: Props) {
	const [hoverAnchor, setHoverAnchor] = useState<HTMLElement | null>(null)
	const [hoverImage, setHoverImage] = useState<ReferenceImage | null>(null)
	const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

	const handleThumbnailEnter = (e: React.MouseEvent<HTMLElement>, img: ReferenceImage) => {
		const target = e.currentTarget
		hoverTimeout.current = setTimeout(() => {
			setHoverAnchor(target)
			setHoverImage(img)
		}, 500)
	}

	const handleThumbnailLeave = () => {
		if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
		setHoverAnchor(null)
	}

	const handleFileSelect = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files ?? [])
			const remainingSlots = MAX_REFERENCE_IMAGES - referenceImages.length
			const filesToProcess = files.slice(0, remainingSlots)

			const newImages: ReferenceImage[] = []
			for (const file of filesToProcess) {
				if (file.size > MAX_FILE_SIZE) {
					continue // Skip files over 1MB
				}

				const base64 = await fileToBase64(file)
				newImages.push({
					base64,
					mimeType: file.type,
					name: file.name,
				})
			}

			onReferenceImagesChange([...referenceImages, ...newImages])

			// Reset the input so the same file can be re-selected
			event.target.value = ''
		},
		[referenceImages, onReferenceImagesChange],
	)

	const handleRemove = useCallback(
		(index: number) => {
			onReferenceImagesChange(referenceImages.filter((_, i) => i !== index))
		},
		[referenceImages, onReferenceImagesChange],
	)

	return (
		<Box>
			<Typography variant="subtitle2" color="text.secondary" gutterBottom>
				Reference images (optional, max {MAX_REFERENCE_IMAGES}, up to 1MB each)
			</Typography>

			{disabledReason && (
				<Typography variant="body2" color="warning.main" sx={{ mb: 1 }}>
					{disabledReason}
				</Typography>
			)}

			<Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
				{referenceImages.map((img, index) => (
					<Box key={index} sx={{ position: 'relative', width: 80, height: 80 }}>
						<Box
							component="img"
							src={`data:${img.mimeType};base64,${img.base64}`}
							alt={img.name}
							onMouseEnter={(e) => handleThumbnailEnter(e, img)}
							onMouseLeave={handleThumbnailLeave}
							sx={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								borderRadius: 1,
							}}
						/>
						<IconButton
							size="small"
							onClick={() => handleRemove(index)}
							sx={{
								position: 'absolute',
								top: -8,
								right: -8,
								bgcolor: 'background.default',
								'& svg': {
									transition: 'color 0.3s',
								},
								'&:hover': {
									bgcolor: 'background.default',
									'& svg': { color: 'error.main' },
								},
							}}
						>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>
				))}

				{referenceImages.length < MAX_REFERENCE_IMAGES && !disabledReason && (
					<Box
						component="label"
						sx={{
							width: 80,
							height: 80,
							borderRadius: 1,
							border: '1px dashed',
							borderColor: 'text.secondary',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
							opacity: 0.6,
							transition: 'opacity 0.2s, border-color 0.2s',
							'&:hover': { opacity: 1, borderColor: 'text.primary' },
						}}
					>
						<AddIcon />
						<input type="file" hidden accept="image/*" multiple onChange={handleFileSelect} />
					</Box>
				)}
			</Stack>

			<Popover
				open={!!hoverAnchor}
				anchorEl={hoverAnchor}
				onClose={handleThumbnailLeave}
				anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
				transformOrigin={{ vertical: 'center', horizontal: 'left' }}
				sx={{ pointerEvents: 'none' }}
				disableRestoreFocus
				slotProps={{ paper: { onTransitionEnd: () => !hoverAnchor && setHoverImage(null) } }}
			>
				{hoverImage && (
					<Box
						component="img"
						src={`data:${hoverImage.mimeType};base64,${hoverImage.base64}`}
						alt={hoverImage.name}
						sx={{ maxWidth: 512, maxHeight: 512, display: 'block' }}
					/>
				)}
			</Popover>
		</Box>
	)
}

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			const result = reader.result as string
			// Remove the data URL prefix "data:image/png;base64,"
			const base64 = result.split(',')[1]
			resolve(base64)
		}
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}
