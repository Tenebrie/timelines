import { Link } from '@tanstack/react-router'
import styled from 'styled-components'

export const NavigationLink = styled(Link).attrs({
	className: 'navigation-link',
})`
	all: unset;
	display: contents;
` as typeof Link
