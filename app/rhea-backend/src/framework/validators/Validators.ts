export const NonEmptyString = (val: string) => !!val
export const NonEmptyNumber = (val: string) => !!val
export const EmailString = (val: string) => !!val && val.includes('@')
export const StringWithFiveCharactersOrMore = (val: string) => !!val && val.length >= 5
