import { useCallback, useMemo } from 'react'

export const useEventIcons = () => {
	const availableIcons: { name: string; path: string }[] = useMemo(
		() => [
			{ name: 'leaf', path: '/assets/tribe-dryad-01.png' },
			{ name: 'beast', path: '/assets/tribe-beast.png' },
			{ name: 'wing', path: '/assets/tribe-bird.png' },
			{ name: 'tower', path: '/assets/tribe-building.png' },
			{ name: 'pitchfork', path: '/assets/tribe-commoner.png' },
			{ name: 'fire', path: '/assets/tribe-elemental-01.png' },
			{ name: 'sea-creature', path: '/assets/tribe-merfolk.png' },
			{ name: 'crown', path: '/assets/tribe-noble-01.png' },
			{ name: 'flag', path: '/assets/tribe-soldier-01.png' },
			{ name: 'storm', path: '/assets/tribe-storm.png' },
			{ name: 'valkyrie', path: '/assets/tribe-valkyrie-01.png' },
			{ name: 'void', path: '/assets/tribe-voidspawn.png' },
		],
		[],
	)

	const listAllIcons = useCallback(() => {
		return availableIcons
	}, [availableIcons])

	const getIconPath = useCallback(
		(name: string) => {
			if (name === 'bundle') {
				return '/assets/bundle.png'
			}
			return availableIcons.find((icon) => icon.name === name)?.path ?? availableIcons[0].path
		},
		[availableIcons],
	)

	return {
		listAllIcons,
		getIconPath,
	}
}
