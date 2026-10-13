import { useState, useEffect } from 'react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './ProductDetails.css'

const FALLBACK_ITEMS = {
  'mock-1': {
    id: 'mock-1',
    title: 'Apple iPhone 13 (128 GB) - Midnight Blue in Mint Condition',
    price: 38500,
    category: 'Mobiles',
    location: 'Kozhikode, Kerala',
    date: 'Today',
    image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=75',
    description: 'Battery health 88%. Original box and bill available. No scratches or dents. Fully functional with original lightning cable included.',
    sellerEmail: 'rahul.tech@example.com'
  },
  'mock-2': {
    id: 'mock-2',
    title: 'Maruti Suzuki Swift VDI 2018 Diesel - Single Owner',
    price: 520000,
    category: 'Cars',
    location: 'Ernakulam, Kerala',
    date: 'Yesterday',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=75',
    description: 'Well maintained, showroom serviced with comprehensive insurance valid till December. Clean interior, all 4 tyres in 80% condition.',
    sellerEmail: 'anshad.motors@example.com'
  },
  'mock-3': {
    id: 'mock-3',
    title: 'Yamaha YZF R15 V3 - 2021 Model BS6',
    price: 135000,
    category: 'Motorcycles',
    location: 'Bangalore, Karnataka',
    date: '2 Oct',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=75',
    description: 'Only 14,000 KM driven. Excellent condition with dual channel ABS. Periodic services completed on time. First owner.',
    sellerEmail: 'karthik.biker@example.com'
  },
  'mock-4': {
    id: 'mock-4',
    title: 'Sony PlayStation 5 Disc Edition with 2 DualSense Controllers',
    price: 42000,
    category: 'Electronics',
    location: 'Mumbai, Maharashtra',
    date: '28 Sep',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=75',
    description: 'Comes with 3 games: Spider-Man 2, FIFA 24, and God of War Ragnarok. Box, cables, and 2 genuine Sony wireless controllers included.',
    sellerEmail: 'gamingzone@example.com'
  }
}

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=75'

function ProductDetails() {
  const { id } = useParams()
  const location = useLocation()
  const { currentUser } = useAuth()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const navigate = useNavigate()

  const initialProduct = location.state?.product || FALLBACK_ITEMS[id] || null

  const [product, setProduct] = useState(initialProduct)
  const [loading, setLoading] = useState(!initialProduct)
  const [error, setError] = useState('')
  const [contactRevealed, setContactRevealed] = useState(false)
  const [imageError, setImageError] = useState(false)

  const displayImage = imageError ? PLACEHOLDER_IMG : (product?.image || PLACEHOLDER_IMG)
  const isFavorite = product ? isInWishlist(product.id) : false

  useEffect(() => {
    async function loadProduct() {
      try {
        const docRef = doc(db, 'products', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() })
        } else if (FALLBACK_ITEMS[id]) {
          setProduct(FALLBACK_ITEMS[id])
        } else {
          setProduct((curr) => {
            if (!curr) setError('Product not found or has been removed by seller.')
            return curr
          })
        }
      } catch (err) {
        console.warn('Network fetch error, using local data:', err.message)
        if (FALLBACK_ITEMS[id]) {
          setProduct(FALLBACK_ITEMS[id])
        } else {
          setProduct((curr) => {
            if (!curr) setError('Failed to load product details.')
            return curr
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  function handleWishlistToggle() {
    if (!currentUser) {
      return navigate('/login')
    }
    toggleWishlist(product)
  }

  function handleContactSeller() {
    if (!currentUser) {
      return navigate('/login')
    }
    setContactRevealed(true)
  }

  if (loading && !product) {
    return (
      <div className="product-details-page">
        <Navbar />
        <div className="product-loading-container">
          <p>Loading product details...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="product-details-page">
        <Navbar />
        <div className="product-error-container">
          <h2>Oops!</h2>
          <p>{error || 'Product not found.'}</p>
          <Link to="/" className="back-home-btn">Return to Home</Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="product-details-page">
      <Navbar />

      <main className="product-details-content">
        {/* Breadcrumb path */}
        <div className="product-breadcrumb">
          <Link to="/">Home</Link> &gt; <span>{product.category || 'Item'}</span> &gt; <span>{product.title}</span>
        </div>

        <div className="product-main-grid">
          <div className="product-left-col">
            <div className="product-image-card">
              <img 
                src={displayImage} 
                alt={product.title} 
                className="product-detail-img" 
                decoding="async"
                onError={() => setImageError(true)}
              />
            </div>

            <div className="product-description-card">
              <h3>Description</h3>
              <p className="description-text">{product.description || 'No description provided by seller.'}</p>
            </div>
          </div>

          <div className="product-right-col">
            <div className="detail-price-card">
              <div className="price-header">
                <span className="detail-price">
                  ₹ {Number(product.price).toLocaleString('en-IN')}
                </span>
                <button 
                  type="button"
                  className={`detail-wishlist-btn ${isFavorite ? 'active' : ''}`}
                  onClick={handleWishlistToggle}
                  title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  aria-label={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  {isFavorite ? (
                    <svg className="heart-icon filled" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                      <path fill="#ff3f55" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0,3.78-3.4 6.86-8.55,11.54L12 21.35z"/>
                    </svg>
                  ) : (
                    <svg className="heart-icon outline" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                      <path fill="none" stroke="#002f34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  )}
                </button>
              </div>

              <h1 className="detail-title">{product.title}</h1>

              <div className="detail-meta">
                <span>📍 {product.location}</span>
                <span>📅 {product.date || 'Recently added'}</span>
              </div>
            </div>

            <div className="detail-seller-card">
              <h3>Seller Information</h3>
              <div className="seller-profile">
                <div className="seller-avatar">
                  {product.sellerEmail ? product.sellerEmail[0].toUpperCase() : 'S'}
                </div>
                <div className="seller-info">
                  <span className="seller-name">
                    {product.sellerEmail ? product.sellerEmail.split('@')[0] : 'Verified Seller'}
                  </span>
                  <span className="seller-badge">Member of OLX community</span>
                </div>
              </div>

              {contactRevealed ? (
                <div className="seller-contact-revealed">
                  <p>📧 <strong>Email:</strong> {product.sellerEmail || 'seller@olx-community.com'}</p>
                  <p>📞 <strong>Phone:</strong> +91 98765 43210</p>
                </div>
              ) : (
                <button 
                  onClick={handleContactSeller}
                  className="contact-seller-btn"
                >
                  Chat with seller
                </button>
              )}
            </div>

            <div className="detail-safety-card">
              <h4>Safety Tips for Buyers</h4>
              <ul>
                <li>Meet the seller at a safe public location</li>
                <li>Check the item thoroughly before paying</li>
                <li>Never share banking OTPs or PINs</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProductDetails
