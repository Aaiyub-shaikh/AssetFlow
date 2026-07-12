import { Navigate } from 'react-router-dom'

export function DepartmentsPage() {
  return <Navigate to="/organization?tab=departments" replace />
}
