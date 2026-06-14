import { AuthProvider } from './context/AuthContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import AppRoutes from './routes.jsx'

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <AppRoutes />
      </CustomerAuthProvider>
    </AuthProvider>
  )
}