import {
	Button,
	Stack,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import { useSelector } from 'react-redux'

import { useAdminGetUsersQuery } from '../../../../../api/rheaApi'
import { getAuthState } from '../../../auth/selectors'

export const AdminUserList = () => {
	const { data } = useAdminGetUsersQuery()

	const { user: loggedInUser } = useSelector(getAuthState)

	if (!data || !loggedInUser) {
		return <></>
	}

	return (
		<Stack>
			<TableContainer>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>Email</TableCell>
						<TableCell>Username</TableCell>
						<TableCell>Level</TableCell>
						<TableCell>Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data.map((user) => (
						<TableRow key={user.id}>
							<TableCell>{user.id}</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>{user.username}</TableCell>
							<TableCell>{user.level}</TableCell>
							<TableCell>
								{loggedInUser.id === user.id && (
									<Typography variant="body2" color="gray">
										This is you
									</Typography>
								)}
								{loggedInUser.id !== user.id && (
									<>
										<Button>Login as</Button>
										<Button>Reset password</Button>
										<Button>Delete</Button>
									</>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</TableContainer>
		</Stack>
	)
}
