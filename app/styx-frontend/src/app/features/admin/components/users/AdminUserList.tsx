import {
	Button,
	MenuItem,
	Select,
	Stack,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
	useAdminGetUserLevelsQuery,
	useAdminGetUsersQuery,
	useAdminSetUserLevelMutation,
} from '../../../../../api/rheaApi'
import { User } from '../../../auth/reducer'
import { getAuthState } from '../../../auth/selectors'
import { adminSlice } from '../../reducer'
import { DeleteUserModal } from './DeleteUserModal'

export const AdminUserList = () => {
	const { data } = useAdminGetUsersQuery()
	const { data: levels } = useAdminGetUserLevelsQuery()
	const [setUserLevel] = useAdminSetUserLevelMutation()

	const { user: loggedInUser } = useSelector(getAuthState)

	const dispatch = useDispatch()

	const onSetUserLevel = useCallback(
		(user: User, level: User['level']) => {
			setUserLevel({
				userId: user.id,
				body: {
					level,
				},
			})
		},
		[setUserLevel]
	)

	const onDelete = useCallback(
		(user: User) => {
			dispatch(adminSlice.actions.openDeleteUserModal(user))
		},
		[dispatch]
	)

	if (!data || !loggedInUser || !levels) {
		return <></>
	}

	return (
		<>
			<Stack component="span">
				<TableContainer component="table">
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
								<TableCell>
									{loggedInUser.id === user.id && user.level}
									{loggedInUser.id !== user.id && (
										<Select
											value={user.level}
											label="Level"
											labelId={`level-${user.id}`}
											onChange={(event) => onSetUserLevel(user, event.target.value as User['level'])}
										>
											{levels.map((option) => (
												<MenuItem key={option} value={option}>
													{option}
												</MenuItem>
											))}
										</Select>
									)}
								</TableCell>
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
											<Button onClick={() => onDelete(user)}>Delete</Button>
										</>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</TableContainer>
			</Stack>
			<DeleteUserModal />
		</>
	)
}
