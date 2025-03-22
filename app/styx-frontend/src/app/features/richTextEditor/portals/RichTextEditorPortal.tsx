import { researchSummonable } from '../../summonable/researchSummonable'
import { RichTextEditorProps } from '../RichTextEditor'

const { Summonable, SummoningPortal } = researchSummonable<RichTextEditorProps>({
	family: 'richTextEditor',
})

export const RichTextEditorPortal = Summonable

export const RichTextEditorPortalSlot = (props: RichTextEditorProps) => {
	return <SummoningPortal props={props} sx={{ width: '100%', height: '100%' }} />
}
