import { z } from 'zod'

export const SUPPORTED_IMAGE_FORMATS = ['webp', 'jpeg', 'png', 'gif'] as const

export const ImageFormatSchema = z.enum(SUPPORTED_IMAGE_FORMATS)

export type ImageFormat = z.infer<typeof ImageFormatSchema>
