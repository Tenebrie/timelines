import { createContext, ReactNode, useContext } from 'react'

interface ResizeableDrawerContextProps {
	height: number
	minHeight: number
	maxHeight: number
	drawerVisible: boolean
	preferredOpen: boolean
	setDrawerHeight: (value: number) => void
	setDrawerVisible: (value: boolean) => void
}

const ResizeableDrawerContext = createContext<ResizeableDrawerContextProps | undefined>(undefined)

type ProviderProps = {
	children: ReactNode | ReactNode[]
	height: number
	minHeight: number
	maxHeight: number
	drawerVisible: boolean
	preferredOpen: boolean
	setDrawerHeight: (value: number) => void
	setDrawerVisible: (value: boolean) => void
}

export function ResizeableDrawerProvider({
	children,
	height,
	minHeight,
	maxHeight,
	drawerVisible,
	preferredOpen,
	setDrawerHeight,
	setDrawerVisible,
}: ProviderProps) {
	return (
		<ResizeableDrawerContext.Provider
			value={{
				height,
				minHeight,
				maxHeight,
				drawerVisible,
				preferredOpen,
				setDrawerHeight,
				setDrawerVisible,
			}}
		>
			{children}
		</ResizeableDrawerContext.Provider>
	)
}

export const useResizeableDrawer = () => {
	const context = useContext(ResizeableDrawerContext)
	if (context === undefined) {
		throw new Error('useResizeableDrawer must be used within a ResizeableDrawerProvider')
	}
	return context
}
