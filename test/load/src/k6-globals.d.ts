// k6 provides console at runtime
declare const console: {
	log(...args: unknown[]): void
	error(...args: unknown[]): void
	warn(...args: unknown[]): void
	info(...args: unknown[]): void
	debug(...args: unknown[]): void
}

// k6 provides __ENV for environment variables
declare const __ENV: Record<string, string | undefined>
