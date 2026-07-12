import { Navigate } from 'react-router-dom'

export function CategoriesPage() {
  return <Navigate to="/organization?tab=categories" replace />
}
