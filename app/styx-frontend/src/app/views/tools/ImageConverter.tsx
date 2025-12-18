import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { RequestImageConversionApiArg, useGetSupportedImageFormatsQuery } from '@/api/otherApi'
import { FilePickerButton } from '@/app/components/FilePickerButton'
import { FormErrorBanner } from '@/app/components/FormErrorBanner'

import { useImageConversion } from './hooks/useImageConversion'

type ImageFormat = RequestImageConversionApiArg['body']['format']

export function ImageConverter() {
	const [quality, setQuality] = useState<number>(100)
	const [width, setWidth] = useState<string>('')
	const [height, setHeight] = useState<string>('')
	const [format, setFormat] = useState<ImageFormat>('webp')

	const { lastConverted, onFilesSelected, errorState } = useImageConversion({
		quality,
		width: width ? Number(width) : undefined,
		height: height ? Number(height) : undefined,
		format,
	})

	const { data: formatData } = useGetSupportedImageFormatsQuery()

	return (
		<Stack spacing={3}>
			<Typography variant="h5" component="h1">
				Image converter
			</Typography>

			<Stack spacing={3}>
				<Box>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						Quality
					</Typography>
					<Input
						type="number"
						value={quality}
						onChange={(event) => setQuality(Number(event.target.value))}
						sx={{ width: '100%' }}
						inputProps={{ min: 1, max: 100 }}
					/>
				</Box>

				<Box>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						Width
					</Typography>
					<Input
						type="number"
						value={width}
						onChange={(event) => setWidth(event.target.value)}
						sx={{ width: '100%' }}
						placeholder="Leave empty for original width"
					/>
				</Box>

				<Box>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						Height
					</Typography>
					<Input
						type="number"
						value={height}
						onChange={(event) => setHeight(event.target.value)}
						sx={{ width: '100%' }}
						placeholder="Leave empty for original height"
					/>
				</Box>

				<Box>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						Output Format
					</Typography>
					<Select
						value={format}
						onChange={(event) => setFormat(event.target.value as ImageFormat)}
						sx={{ width: '100%' }}
					>
						{formatData?.formats.map((format) => (
							<MenuItem key={format} value={format}>
								{format.toUpperCase()}
							</MenuItem>
						))}
					</Select>
				</Box>

				<Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
					<FilePickerButton onSelect={onFilesSelected} />
				</Stack>
			</Stack>

			{lastConverted && (
				<Button
					component="a"
					download={lastConverted.name}
					href={lastConverted.href}
					sx={{ alignSelf: 'flex-start' }}
				>
					Download {lastConverted.name}
				</Button>
			)}

			<FormErrorBanner errorState={errorState} />
		</Stack>
	)
}
