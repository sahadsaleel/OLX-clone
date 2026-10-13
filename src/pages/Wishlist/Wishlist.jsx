import { Link, useNavigate } from 'react-router-dom'
import { useWishlist } from '../../context/WishlistContext'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import ProductCard from '../../components/ProductCard/ProductCard'
import './Wishlist.css'

function Wishlist() {
  const { wishlist } = useWishlist()
  const navigate = useNavigate()

  return (
    <div className="wishlist-page-wrapper">
      <Navbar />

      <main className="wishlist-content">
        <h2 className="wishlist-heading">My Wishlist ({wishlist.length})</h2>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist-box">
            <div className="empty-icon">❤️</div>
            <h3>Your wishlist is empty</h3>
            <p>Explore ads and tap the heart icon on any item to save it for later.</p>
            <Link to="/" className="explore-btn">
              Discover recommendations
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {wishlist.map((product) => (
              <div 
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                className="product-card-clickable"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Wishlist
