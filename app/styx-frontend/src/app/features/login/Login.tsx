import { useAuthControllerRegisterMutation } from '../../../api/rheaApi'

export const Login = () => {
	const [doRegister] = useAuthControllerRegisterMutation()

	return <div>Test</div>
}
