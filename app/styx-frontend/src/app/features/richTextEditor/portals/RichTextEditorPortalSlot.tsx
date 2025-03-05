import { RichTextEditorProps } from '../RichTextEditor'
import { SetPortalPosition } from './RichTextEditorPortal'

export const RichTextEditorPortalSlot = (props: RichTextEditorProps) => {
	return <div style={{ width: '100%', height: '100%' }} ref={(ref) => SetPortalPosition(ref, props)}></div>
}
