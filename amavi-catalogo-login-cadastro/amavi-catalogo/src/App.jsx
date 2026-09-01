import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProductForm from './pages/admin/AdminProductForm'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/produto/:id" element={<Layout><ProductDetail /></Layout>} />
      <Route path="/carrinho" element={<Layout><Cart /></Layout>} />

      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/admin/login" element={<Navigate to="/login?tipo=admin" replace />} />

      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="produtos/novo" element={<AdminProductForm />} />
        <Route path="produtos/:id/editar" element={<AdminProductForm />} />
      </Route>

      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  )
}
