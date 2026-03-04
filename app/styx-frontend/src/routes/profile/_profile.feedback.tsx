import { createFileRoute } from '@tanstack/react-router'

import { FeedbackPage } from '@/app/views/profile/pages/FeedbackPage'

export const Route = createFileRoute('/profile/_profile/feedback')({
	component: RouteComponent,
})

function RouteComponent() {
	return <FeedbackPage />
}
