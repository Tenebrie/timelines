import { useConvertImageMutation } from '@api/otherApi'
import Input from '@mui/material/Input'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { FilePickerButton } from '@/app/components/FilePickerButton'
import { FormErrorBanner } from '@/app/components/FormErrorBanner'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useErrorState } from '@/app/utils/useErrorState'

export function Tools() {
	const [convertImage] = useConvertImageMutation()
	const [lastConverted, setLastConverted] = useState<{
		name: string
		extension: string
		path: string
	} | null>(null)

	const [quality, setQuality] = useState<number>(80)
	const [width, setWidth] = useState<string>('')
	const [height, setHeight] = useState<string>('')
	const [format, setFormat] = useState<string>('webp')

	const errorState = useErrorState<{ conversionError: string }>()
	const { error, raiseError, clearError } = errorState

	const onFilesSelected = async (fileList: FileList) => {
		clearError()
		const file = fileList[0]
		const reader = new FileReader()

		reader.onload = async (event) => {
			if (!event.target) {
				return
			}
			const base64File = event.target.result
			if (!base64File || typeof base64File !== 'string') {
				return
			}

			try {
				console.log(width)
				console.log(height)
				const { response, error } = parseApiResponse(
					await convertImage({
						body: {
							// @ts-ignore
							image: base64File,
							format,
							quality,
							width: width.length > 0 ? Number(width) : undefined,
							height: height.length > 0 ? Number(height) : undefined,
						},
					}),
				)
				if (error) {
					raiseError('conversionError', error.message)
					return
				}
				const nameWithoutExtension = file.name.split('.').slice(0, -1).join('.')
				setLastConverted({
					name: nameWithoutExtension,
					extension: format,
					path: response.path,
				})
			} catch (error) {
				console.error(error)
			}
		}

		reader.readAsDataURL(file)
	}

	return (
		<Paper elevation={2} sx={{ marginTop: 4, padding: 4, minWidth: 500 }}>
			<Stack direction="column" gap={2} width={1}>
				<Typography variant="h5">Image converter</Typography>
				<Stack direction="column" gap={2} width={1}>
					<Stack direction="row" alignItems="center" gap={1} justifyContent="space-between">
						<Typography>Quality (Optional):</Typography>
						<Input
							type="number"
							value={quality}
							onChange={(event) => setQuality(Number(event.target.value))}
						/>
					</Stack>
					<Stack direction="row" alignItems="center" gap={1} justifyContent="space-between">
						<Typography>Width (Optional):</Typography>
						<Input type="number" value={width} onChange={(event) => setWidth(event.target.value)} />
					</Stack>
					<Stack direction="row" alignItems="center" gap={1} justifyContent="space-between">
						<Typography>Height (Optional):</Typography>
						<Input type="number" value={height} onChange={(event) => setHeight(event.target.value)} />
					</Stack>
					<Stack direction="row" alignItems="center" gap={1} justifyContent="space-between">
						<Typography>Format (webp, jpeg, png, gif):</Typography>
						<Input value={format} onChange={(event) => setFormat(event.target.value)} />
					</Stack>
					<FilePickerButton onSelect={onFilesSelected} />
				</Stack>
				{lastConverted && (
					<a
						download={lastConverted.name}
						href={`/api/fs/image/${lastConverted.extension}/${lastConverted.path}`}
					>
						Download {lastConverted.name}.{lastConverted.extension ?? 'webp'}
					</a>
				)}
				<FormErrorBanner errorState={errorState} />
			</Stack>
		</Paper>
	)
}
