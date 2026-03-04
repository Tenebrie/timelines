import { useLoginWithGoogleMutation } from '@api/authApi'
import { useCallback, useEffect, useState } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { useHandleUserLogin } from './useHandleUserLogin'

export function useGoogleAuth() {
	const [ready, setReady] = useState(false)
	const [loginWithGoogle] = useLoginWithGoogleMutation()
	const handleUserLogin = useHandleUserLogin()

	const onReady = useCallback(() => setReady(true), [])

	useEffect(() => {
		async function handleMessage(event: MessageEvent) {
			if (event.data?.type === 'google-signin-ready') {
				setReady(true)
				return
			}

			if (event.data?.type !== 'google-signin-credential') {
				return
			}

			const credential: string = event.data.credential
			const result = parseApiResponse(await loginWithGoogle({ body: { googleToken: credential } }))
			if (result.error) {
				return
			}

			await handleUserLogin(result.response)
		}

		window.addEventListener('message', handleMessage)
		return () => window.removeEventListener('message', handleMessage)
	}, [handleUserLogin, loginWithGoogle])

	return { ready, onReady }
}
