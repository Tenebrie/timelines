import styled from 'styled-components'

const Logo = styled.img`
	max-width: 100px;
`

type Props = {
	sizeScalar?: number
}

export const TenebrieLogo = ({ sizeScalar: providedSizeScalar }: Props) => {
	const sizeScalar = providedSizeScalar ?? 1
	return <Logo src="/logo.webp" alt="Logo" style={{ height: 155 * sizeScalar }} />
}
