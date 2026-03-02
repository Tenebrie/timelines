declare module 'astrowind:config' {
	import type {
		AnalyticsConfig,
		AppBlogConfig,
		I18NConfig,
		MetaDataConfig,
		SiteConfig,
		UIConfig,
	} from './config'

	export const SITE: SiteConfig
	export const I18N: I18NConfig
	export const METADATA: MetaDataConfig
	export const APP_BLOG: AppBlogConfig
	export const UI: UIConfig
	export const ANALYTICS: AnalyticsConfig
}
