export const isEntityNameValid = (name: string) => {
	if (!name.trim() || name.toLowerCase() === 'empty') {
		return {
			valid: false,
			error: "Name can't be empty",
		}
	}

	return {
		valid: true,
		error: undefined,
	}
}
