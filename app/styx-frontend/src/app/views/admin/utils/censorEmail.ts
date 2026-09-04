export function censorEmail(email: string): string {
	const atIndex = email.indexOf('@')
	if (atIndex === -1) return email.replace(/./g, '•')
	return email.substring(0, atIndex).replace(/[^.]/g, '•') + email.substring(atIndex)
}
