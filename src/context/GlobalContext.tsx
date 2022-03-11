import React, { createContext, useState } from 'react'

const EmptyFunction = () => {
	/* Empty */
}

type ContextType = {
	counter: number
	setCounter: (value: number) => void
	bumpCounter: () => void
}

const mockDefaultValue: ContextType = {
	counter: 0,
	setCounter: EmptyFunction,
	bumpCounter: EmptyFunction,
}

export const GlobalContext = createContext<ContextType>(mockDefaultValue)

export const GlobalContextProvider = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
	const [counter, setCounter] = useState(0)
	const bumpCounter = () => setCounter(counter + 1)

	return <GlobalContext.Provider value={{ counter, setCounter, bumpCounter }}>{children}</GlobalContext.Provider>
}
