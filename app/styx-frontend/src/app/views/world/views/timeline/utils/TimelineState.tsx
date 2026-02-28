import { ScaleLevel } from '@/app/schema/ScaleLevel'

import { DividerData } from '../anchor/hooks/useAnchorLines'

export const TimelineState = {
	scroll: 0,
	width: 0,
	height: 0,
	scaleLevel: 0 as ScaleLevel,
	canOpenContextMenu: true,
	anchorTimestamps: [] as number[],
	anchorTimestampExtended: [] as DividerData[],
}
