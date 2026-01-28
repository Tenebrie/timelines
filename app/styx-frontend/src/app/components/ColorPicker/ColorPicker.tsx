import OutlinedInput from '@mui/material/OutlinedInput'
import Stack from '@mui/material/Stack'
import { memo, useEffect, useMemo, useState } from 'react'

import { darkTheme, lightTheme } from '../../features/theming/themes'
import { colorStringToHsl, colorStringToHslWithDefault } from '../../utils/colors/colorStringToHsl'
import { hslToHex } from '../../utils/colors/hslToHex'
import { ColoredChip } from './ColoredChip'
import { ColorPickerSliders } from './ColorPickerSliders'
import { SavedColors } from './SavedColors'

type Props = {
	initialValue?: string
	onChangeHex?: (value: string) => void
	onChangeHsl?: (value: string) => void
}

export const ColorPicker = memo(ColorPickerComponent)

export function ColorPickerComponent({ initialValue, onChangeHex, onChangeHsl }: Props) {
	const parsedValue = useMemo(
		() => colorStringToHslWithDefault(initialValue ?? 'hsl(180, 100%, 50%)', { h: 0.5, s: 1, l: 0.5 }),
		[initialValue],
	)

	const [inputValue, setInputValue] = useState<string | null>(null)

	/**
	 * For precise RGB -> HSL conversions, internal values range from 0 to 1000 instead of 0 to 100.
	 */
	const [hue, setHue] = useState(Math.round(parsedValue.h * 360))
	const [saturation, setSaturation] = useState(Math.round(parsedValue.s * 1000))
	const [lightness, setLightness] = useState(Math.round(parsedValue.l * 1000))

	const calculatedHue = useMemo(() => Math.round(hue), [hue])
	const color = useMemo(
		() => `hsl(${calculatedHue}, ${Math.round(saturation / 10)}%, ${Math.round(lightness / 10)}%)`,
		[calculatedHue, lightness, saturation],
	)

	const onSetFullValue = (value: string) => {
		setInputValue(value)

		try {
			const parsedValue = colorStringToHsl(value)
			setHue(Math.max(0, Math.min(360, Math.round(parsedValue.h * 360))))
			setSaturation(Math.max(0, Math.min(1000, Math.round(parsedValue.s * 1000))))
			setLightness(Math.max(0, Math.min(1000, Math.round(parsedValue.l * 1000))))
		} catch {
			//
		}
	}

	useEffect(() => {
		const hexValue = hslToHex(hue / 360, saturation / 1000, lightness / 1000)
		if (hexValue === initialValue || color === initialValue) {
			return
		}

		onChangeHex?.(hexValue)
		onChangeHsl?.(color)
	}, [color, lightness, onChangeHex, onChangeHsl, saturation, hue, initialValue])

	return (
		<Stack direction="column" gap={2}>
			<Stack direction="row" gap={4}>
				<Stack direction="column" justifyContent="space-between" gap={1}>
					<Stack direction="row" sx={{ width: '100%', height: '100%' }} gap={1}>
						<div
							data-testid="color-preview"
							style={{
								backgroundColor: color,
								width: '50%',
								height: '100%',
								borderRadius: '4px',
							}}
						></div>
						<Stack direction="column" sx={{ width: '50%', height: '100%' }} gap={1}>
							<div
								style={{
									backgroundColor: lightTheme.palette.background.paper,
									width: '100%',
									height: '100%',
									borderRadius: '4px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<ColoredChip text="Name" color={color} />
							</div>
							<div
								style={{
									backgroundColor: darkTheme.palette.background.paper,
									width: '100%',
									height: '100%',
									borderRadius: '4px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<ColoredChip text="Name" color={color} />
							</div>
						</Stack>
					</Stack>
					<OutlinedInput
						size="small"
						sx={{ width: '192px' }}
						value={inputValue ?? color}
						data-testid="color-input"
						onChange={(event) => onSetFullValue(event.target.value)}
					/>
				</Stack>
				<Stack
					direction="column"
					width="100%"
					gap={1}
					sx={{
						'* .MuiSlider-rail': {
							'--hue': `${hue}deg`,
							'--saturation': `${saturation / 10}%`,
							'--lightness': `${lightness / 10}%`,
						},
					}}
				>
					<ColorPickerSliders
						color={color}
						hue={hue}
						saturation={saturation}
						lightness={lightness}
						onHueChange={setHue}
						onSaturationChange={setSaturation}
						onLightnessChange={setLightness}
						resetInputValue={() => setInputValue(null)}
					/>
				</Stack>
			</Stack>
			<SavedColors
				currentColor={color}
				onSelectColor={(color) => {
					const parsedValue = colorStringToHslWithDefault(color, { h: 0.5, s: 1, l: 0.5 })
					setHue(Math.round(parsedValue.h * 360))
					setSaturation(Math.round(parsedValue.s * 1000))
					setLightness(Math.round(parsedValue.l * 1000))
				}}
			/>
		</Stack>
	)
}
