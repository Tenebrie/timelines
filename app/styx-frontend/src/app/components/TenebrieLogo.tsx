import styled from 'styled-components'

const Logo = styled.img`
	max-width: 300px;
`

type Props = {
	sizeScalar?: number
}

export const TenebrieLogo = ({ sizeScalar: providedSizeScalar }: Props) => {
	const sizeScalar = providedSizeScalar ?? 1
	return (
		<Logo
			src="/logo-celestial-bow.webp"
			alt="Neverkin Logo"
			style={{ height: 155 * sizeScalar, marginLeft: -0 }}
		/>
	)
}
