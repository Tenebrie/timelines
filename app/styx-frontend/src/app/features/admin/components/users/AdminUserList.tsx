import { Search } from '@mui/icons-material'
import {
	Button,
	Divider,
	Input,
	InputAdornment,
	Link,
	Pagination,
	Stack,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material'
import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'

import { useAdminGetUsersQuery } from '../../../../../api/rheaApi'
import { User } from '../../../auth/reducer'
import { getAuthState } from '../../../auth/selectors'
import { adminSlice } from '../../reducer'
import { DeleteUserModal } from './DeleteUserModal'
import { UserAccessLevelDropdown } from './UserAccessLevelDropdown'

export const AdminUserList = () => {
	const [page, setPage] = useState(0)

	const { data } = useAdminGetUsersQuery({
		page,
		size: 50,
	})

	const { user: loggedInUser } = useSelector(getAuthState)

	const dispatch = useDispatch()

	const onDelete = useCallback(
		(user: User) => {
			dispatch(adminSlice.actions.openDeleteUserModal(user))
		},
		[dispatch],
	)

	const formatDate = useCallback((date: string) => {
		return new Date(date).toLocaleString('en-US', {
			year: 'numeric', // e.g., '2023'
			month: 'short', // e.g., 'Oct'
			day: 'numeric', // e.g., '27'
			hour: '2-digit', // e.g., '08'
			minute: '2-digit', // e.g., '30'
			second: '2-digit', // e.g., '45'
			hour12: false, // AM/PM format
		})
	}, [])

	if (!data || !loggedInUser) {
		return <></>
	}

	return (
		<Stack alignItems="center">
			<Stack sx={{ paddingTop: 2 }} direction="row" gap={1}>
				<Input
					placeholder="Search"
					startAdornment={
						<InputAdornment position="start">
							<Search />
						</InputAdornment>
					}
				/>
				<Divider orientation="vertical" />
				<Pagination count={data.pageCount} onChange={(_, page) => setPage(page - 1)} />
			</Stack>
			<Stack component="span">
				<TableContainer component="table">
					<TableHead>
						<TableRow>
							<TableCell width={250}>Email</TableCell>
							<TableCell width={200}>Username</TableCell>
							<TableCell width={205}>Level</TableCell>
							<TableCell width={160}>Created At</TableCell>
							<TableCell width={160}>Updated At</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{data.users.map((user) => (
							<TableRow key={user.id} sx={{ height: '75px' }}>
								<TableCell>
									<Link component={NavLink} to={`/admin/${user.id}`}>
										{user.email}
									</Link>
								</TableCell>
								<TableCell>{user.username}</TableCell>
								<TableCell>
									<UserAccessLevelDropdown user={user} />
								</TableCell>
								<TableCell>{formatDate(user.createdAt)}</TableCell>
								<TableCell>{formatDate(user.updatedAt)}</TableCell>
								<TableCell>
									{loggedInUser.id === user.id && (
										<Typography variant="body2" color="gray" marginLeft={0.7}>
											Despite everything, this is still you
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
		</Stack>
	)
}
