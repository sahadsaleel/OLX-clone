import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import SellProduct from './pages/SellProduct/SellProduct'
import ProductDetails from './pages/ProductDetails/ProductDetails'
import Wishlist from './pages/Wishlist/Wishlist'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/product/:id" element={<ProductDetails />} />

            <Route path="/sell" element={
                <ProtectedRoute>
                  <SellProduct />
                </ProtectedRoute>
              } 
            />
            <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </WishlistProvider>
    </AuthProvider>
  )
}

export default App
