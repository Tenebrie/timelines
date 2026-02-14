import { ActorService } from './ActorService.js'
import { TagService } from './TagService.js'
import { WikiService } from './WikiService.js'
import { WorldEventService } from './WorldEventService.js'

export type BaselineActor = Awaited<ReturnType<typeof ActorService.findActorOrThrow>>
export type BaselineArticle = Awaited<ReturnType<typeof WikiService.findArticleByIdOrThrow>>
export type BaselineWorldEvent = Awaited<ReturnType<typeof WorldEventService.fetchWorldEventWithDetails>>
export type BaselineTag = Awaited<ReturnType<typeof TagService.findTagOrThrow>>
