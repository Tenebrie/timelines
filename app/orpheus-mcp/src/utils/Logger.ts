const COLORS = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	dim: '\x1b[2m',
	cyan: '\x1b[36m',
	yellow: '\x1b[33m',
	green: '\x1b[32m',
	red: '\x1b[31m',
	magenta: '\x1b[35m',
}

function formatTimestamp(): string {
	return new Date().toISOString()
}

function formatArgs(args: unknown): string {
	if (args === undefined || args === null) {
		return 'none'
	}
	try {
		return JSON.stringify(args, null, 2)
	} catch {
		return String(args)
	}
}

export const Logger = {
	toolInvocation: (toolName: string, args: unknown) => {
		console.info(
			`${COLORS.dim}[${formatTimestamp()}]${COLORS.reset} ` +
				`${COLORS.cyan}${COLORS.bright}TOOL${COLORS.reset} ` +
				`${COLORS.magenta}${toolName}${COLORS.reset} ` +
				`${COLORS.dim}invoked with:${COLORS.reset}`,
		)
		console.info(`${COLORS.yellow}${formatArgs(args)}${COLORS.reset}`)
	},

	toolSuccess: (toolName: string, resultPreview?: string) => {
		console.info(
			`${COLORS.dim}[${formatTimestamp()}]${COLORS.reset} ` +
				`${COLORS.green}${COLORS.bright}SUCCESS${COLORS.reset} ` +
				`${COLORS.magenta}${toolName}${COLORS.reset}` +
				(resultPreview ? ` ${COLORS.dim}→ ${resultPreview}${COLORS.reset}` : ''),
		)
	},

	toolError: (toolName: string, error: unknown) => {
		console.info(
			`${COLORS.dim}[${formatTimestamp()}]${COLORS.reset} ` +
				`${COLORS.red}${COLORS.bright}ERROR${COLORS.reset} ` +
				`${COLORS.magenta}${toolName}${COLORS.reset} ` +
				`${COLORS.red}${error instanceof Error ? error.message : String(error)}${COLORS.reset}`,
		)
	},

	info: (message: string) => {
		console.info(
			`${COLORS.dim}[${formatTimestamp()}]${COLORS.reset} ${COLORS.cyan}INFO${COLORS.reset} ${message}`,
		)
	},

	debug: (message: string) => {
		console.info(
			`${COLORS.dim}[${formatTimestamp()}]${COLORS.reset} ${COLORS.dim}DEBUG ${message}${COLORS.reset}`,
		)
	},
}
