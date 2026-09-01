import Header from './Header'
import Footer from './Footer'
import CartDrawer from './CartDrawer'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream font-body text-ink">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
