import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import MobileBottomNav from './MobileBottomNav'
import Footer from './Footer'

export default function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>
      <MobileBottomNav />
      {/* <Footer /> */}
    </div>
  )
}
