/// <reference types="@rsbuild/core/client" />
/// <reference types="@types/google.accounts" />

declare const __APP_VERSION__: string
declare const __BUILD_TIME__: string

interface ImportMeta {
	webpackHot?: {
		accept: (dep?: string | string[] | (() => void), cb?: () => void) => void
		decline: (dep?: string | string[]) => void
		dispose: (cb: (data: object) => void) => void
		addDisposeHandler: (cb: (data: object) => void) => void
		removeDisposeHandler: (cb: (data: object) => void) => void
		addStatusHandler: (cb: (status: string) => void) => void
		removeStatusHandler: (cb: (status: string) => void) => void
		status: () => string
		invalidate: () => void
	}
}
