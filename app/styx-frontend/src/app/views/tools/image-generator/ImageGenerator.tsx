import { useListImageGenerationModelsQuery } from '@api/otherApi'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { FormErrorBanner } from '@/app/components/FormErrorBanner'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { useDebounce } from '@/app/hooks/useDebounce'
import { LoadingSelect } from '@/ui-lib/components/LoadingSelect/LoadingSelect'

import { GenerationHistory } from './components/GenerationHistory'
import { ReferenceImagePicker } from './components/ReferenceImagePicker'
import { useImageGeneration } from './hooks/useImageGeneration'

export function ImageGenerator() {
	const savedPrompt = useSelector(
		(state: { preferences: { imageGenerator: { lastPrompt: string } } }) =>
			state.preferences.imageGenerator.lastPrompt,
	)
	const dispatch = useDispatch()
	const { setImageGeneratorPrompt } = preferencesSlice.actions

	const savePrompt = useDebounce(
		useCallback(
			(value: string) => dispatch(setImageGeneratorPrompt(value)),
			[dispatch, setImageGeneratorPrompt],
		),
		500,
	)

	const [prompt, setPrompt] = useState(savedPrompt)
	const [model, setModel] = useState('')
	const [referenceImages, setReferenceImages] = useState<
		Array<{ base64: string; mimeType: string; name: string }>
	>([])

	const { data: modelData } = useListImageGenerationModelsQuery()
	const { generate, isGenerating, errorState } = useImageGeneration()

	// Auto-select first model when data loads
	if (modelData?.models && modelData.models.length > 0 && !model) {
		setModel(modelData.models[0].id)
	}

	const handleGenerate = async () => {
		await generate({
			prompt,
			model,
			referenceImages: referenceImages.map(({ base64, mimeType }) => ({ base64, mimeType })),
		})
	}

	const canGenerate = prompt.trim().length > 0 && model && !isGenerating

	return (
		<Stack spacing={3}>
			<Typography variant="h5" component="h1">
				AI Image Generator
			</Typography>

			<Stack spacing={3}>
				{/* Prompt */}
				<Box>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						Prompt
					</Typography>
					<TextField
						multiline
						minRows={3}
						maxRows={8}
						value={prompt}
						onChange={(e) => {
							setPrompt(e.target.value)
							savePrompt(e.target.value)
						}}
						placeholder="Describe the image you want to generate..."
						fullWidth
						inputProps={{ maxLength: 8192 }}
						helperText={`${prompt.length}/8192`}
					/>
				</Box>

				{/* Model */}
				<Box>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						Model
					</Typography>
					<LoadingSelect
						value={model}
						isLoading={!modelData}
						onChange={(e) => setModel(e.target.value)}
						fullWidth
					>
						{modelData?.models?.map((m: { id: string; name: string }) => (
							<MenuItem key={m.id} value={m.id}>
								{m.name}
							</MenuItem>
						))}
					</LoadingSelect>
				</Box>

				{/* Reference images */}
				<ReferenceImagePicker
					referenceImages={referenceImages}
					onReferenceImagesChange={setReferenceImages}
					disabledReason={
						model.includes('imagen')
							? 'Reference images are not supported by Imagen models. Select a Gemini model to use this feature.'
							: undefined
					}
				/>

				{/* Generate button */}
				<Stack direction="row" justifyContent="flex-end">
					<Button
						startIcon={<AutoAwesomeIcon />}
						variant="contained"
						onClick={handleGenerate}
						disabled={!canGenerate}
						loading={isGenerating}
					>
						Generate
					</Button>
				</Stack>
			</Stack>

			<FormErrorBanner errorState={errorState} />

			{/* Generation history */}
			<GenerationHistory />
		</Stack>
	)
}
