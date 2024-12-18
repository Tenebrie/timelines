import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'

import { useAdminGetUsersQuery } from '@/api/adminUsersApi'
import { User } from '@/app/features/auth/reducer'
import { getAuthState } from '@/app/features/auth/selectors'

import { adminSlice } from '../../reducer'
import { DeleteUserModal } from './DeleteUserModal'
import { Pagination } from './Pagination'
import { SearchInput } from './SearchInput'
import { UserAccessLevelDropdown } from './UserAccessLevelDropdown'

const pageSize = 14

export const AdminUserList = () => {
	const [page, setPage] = useState(0)
	const [query, setQuery] = useState('')

	const { data } = useAdminGetUsersQuery({
		page,
		size: pageSize,
		query,
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
		<Paper elevation={2} sx={{ marginTop: 4 }}>
			<Stack
				sx={{ padding: '16px 16px' }}
				direction="row"
				gap={1}
				justifyContent="space-between"
				width="calc(100% - 32px)"
				alignItems="center"
			>
				<Stack flexBasis="10%" />
				<Stack alignItems="center" sx={{ flexBasis: '33.3333%' }}>
					<Pagination initialPage={page} pageCount={data.pageCount} onChange={setPage} />
				</Stack>
				<SearchInput
					initialQuery={query}
					onChange={(value: string) => {
						setQuery(value)
						setPage(0)
					}}
				/>
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
							<TableCell width={270}>Actions</TableCell>
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
		</Paper>
	)
}
