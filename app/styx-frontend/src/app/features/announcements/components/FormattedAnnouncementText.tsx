import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { Fragment, useMemo } from 'react'

const urlPattern = /(https?:\/\/[^\s]+)/g

const formatLine = (line: string, lineIndex: number) => {
	const parts = line.split(urlPattern)
	return (
		<Fragment key={lineIndex}>
			{lineIndex > 0 && <br />}
			{parts.map((part, partIndex) =>
				urlPattern.test(part) ? (
					<Link key={partIndex} href={part} target="_blank" rel="noopener noreferrer">
						{part}
					</Link>
				) : (
					<Fragment key={partIndex}>{part}</Fragment>
				),
			)}
		</Fragment>
	)
}

const formatParagraph = (paragraph: string, paragraphIndex: number) => {
	const lines = paragraph.split('\n').map(formatLine)
	return (
		<Box key={paragraphIndex} component="p" sx={{ margin: 0, '& + &': { marginTop: 1 } }}>
			{lines}
		</Box>
	)
}

type Props = {
	text: string
}

export const FormattedAnnouncementText = ({ text }: Props) => {
	const formatted = useMemo(() => text.split('\n\n').map(formatParagraph), [text])
	return <>{formatted}</>
}
