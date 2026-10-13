import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import './ProductCard.css'

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=75'

function ProductCard({ product }) {
  const { currentUser } = useAuth()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const navigate = useNavigate()
  const [imgSrc, setImgSrc] = useState(product.image || PLACEHOLDER_IMG)

  const isFavorite = isInWishlist(product.id)

  const handleFavoriteClick = (e) => {
    e.stopPropagation() 

    if (!currentUser) {
      return navigate('/login')
    }

    toggleWishlist(product)
  }

  return (
    <div className="product-card">
      <div className="product-card-image-box">
        <img 
          src={imgSrc} 
          alt={product.title} 
          className="product-card-image"
          loading="lazy"
          decoding="async"
          onError={() => setImgSrc(PLACEHOLDER_IMG)}
        />
        <button 
          type="button"
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isFavorite ? (
            <svg className="heart-icon filled" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path 
                fill="#ff3f55" 
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0,3.78-3.4 6.86-8.55,11.54L12 21.35z"
              />
            </svg>
          ) : (
            <svg className="heart-icon outline" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path 
                fill="none" 
                stroke="#002f34" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="product-card-content">
        <div className="product-card-price">
          ₹ {Number(product.price).toLocaleString('en-IN')}
        </div>
        <h3 className="product-card-title" title={product.title}>
          {product.title}
        </h3>
        
        <div className="product-card-footer">
          <span className="product-card-location">{product.location}</span>
          <span className="product-card-date">{product.date || 'Today'}</span>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
