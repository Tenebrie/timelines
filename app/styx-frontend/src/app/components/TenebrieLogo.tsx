import styled from 'styled-components'

import { useMobileLayout } from '../hooks/useMobileLayout'

const Logo = styled.img`
	max-width: 300px;
`

type Props = {
	sizeScalar?: number
}

export const TenebrieLogo = ({ sizeScalar: providedSizeScalar }: Props) => {
	const sizeScalar = providedSizeScalar ?? 1
	const { isMobile } = useMobileLayout()
	return (
		<Logo
			src="/logo-dragon.webp"
			alt="Neverkin Logo"
			style={{ height: (isMobile ? 80 : 155) * sizeScalar, marginLeft: -0 }}
		/>
	)
}

export const TenebrieLogoInline = () => {
	return (
		<Logo
			src="/logo-dragon.webp"
			alt="Neverkin Logo"
			style={{ display: 'inline-block', marginLeft: 0, height: '2em', marginTop: '-0.15em' }}
		/>
	)
}
