import styled from 'styled-components'

export const ShortText = styled.span<{ inactive: boolean }>`
	color: pink;
	text-decoration: ${(props) => (props.inactive ? 'line-through' : 'none')};
`
