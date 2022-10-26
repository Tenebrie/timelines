export const NonEmptyString = (val: string) => !!val
export const EmailString = (val: string) => !!val && val.includes('@')
