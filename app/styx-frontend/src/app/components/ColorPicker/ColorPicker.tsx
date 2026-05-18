import OutlinedInput from '@mui/material/OutlinedInput'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { memo, useEffect, useMemo, useState } from 'react'

import {
	DARK_LUMINANCE_THRESHOLD,
	getColorLuminance,
	LIGHT_LUMINANCE_THRESHOLD,
} from '@/app/utils/colors/getColorLuminance'

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
	luminanceCorrection?: boolean
}

export const ColorPicker = memo(ColorPickerComponent)

export function ColorPickerComponent({
	initialValue = 'hsl(180, 100%, 50%)',
	onChangeHex,
	onChangeHsl,
	luminanceCorrection = false,
}: Props) {
	const parsedValue = useMemo(
		() => colorStringToHslWithDefault(initialValue, { h: 0.5, s: 1, l: 0.5 }),
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

	const { palette } = useTheme()
	const isDark = palette.mode === 'dark'

	const hexColor = useMemo(
		() => hslToHex(hue / 360, saturation / 1000, lightness / 1000),
		[hue, saturation, lightness],
	)
	const luminance = useMemo(
		() => (luminanceCorrection ? getColorLuminance(hexColor) : null),
		[hexColor, luminanceCorrection],
	)
	const tooDark = luminance !== null && luminance < DARK_LUMINANCE_THRESHOLD
	const tooLight = luminance !== null && luminance > LIGHT_LUMINANCE_THRESHOLD

	const invertedColor = useMemo(
		() => `hsl(${calculatedHue}, ${Math.round(saturation / 10)}%, ${Math.round((1000 - lightness) / 10)}%)`,
		[calculatedHue, saturation, lightness],
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
		if (hexColor === initialValue || color === initialValue) {
			return
		}

		onChangeHex?.(hexColor)
		onChangeHsl?.(color)
	}, [color, hexColor, onChangeHex, onChangeHsl, initialValue])

	return (
		<Stack direction="column" gap={2}>
			<Stack direction="row" gap={4}>
				<Stack direction="column" justifyContent="space-between" gap={1}>
					<Stack direction="row" sx={{ width: '100%', height: '100%' }} gap={1}>
						<div
							data-testid="color-preview"
							style={{
								['--text-color' as string]: color,
								backgroundColor:
									luminanceCorrection && ((isDark && tooDark) || (!isDark && tooLight))
										? 'oklch(from var(--text-color) calc(1 - l) c h)'
										: color,
								width: '50%',
								height: '100%',
								borderRadius: '4px',
							}}
						/>
						<Stack direction="column" sx={{ width: '50%', height: '100%' }} gap={1}>
							<div
								style={{
									backgroundColor: lightTheme({ reduceAnimations: false }).palette.background.paper,
									width: '100%',
									height: '100%',
									borderRadius: '4px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<ColoredChip text="Name" color={tooLight ? invertedColor : color} />
							</div>
							<div
								style={{
									backgroundColor: darkTheme({ reduceAnimations: false }).palette.background.paper,
									width: '100%',
									height: '100%',
									borderRadius: '4px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<ColoredChip text="Name" color={tooDark ? invertedColor : color} />
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
