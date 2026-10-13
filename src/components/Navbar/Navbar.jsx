import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import './Navbar.css'
import logo from '../../assets/symbol.png'
import searchIcon from '../../assets/search.svg'
import searchGreyIcon from '../../assets/search1.svg'
import arrowIcon from '../../assets/arrow-down.svg'

function Navbar() {
  const { currentUser, logout } = useAuth()
  const { wishlist } = useWishlist()
  const navigate = useNavigate()

  const wishlistCount = wishlist ? wishlist.length : 0

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Failed to log out', err)
    }
  }

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="OLX Logo" />
        </Link>

        <div className="navbar-location-box">
          <img src={searchGreyIcon} alt="Location search" className="input-icon" />
          <input 
            type="text" 
            placeholder="Search city, area or local..." 
            defaultValue="India" 
          />
          <img src={arrowIcon} alt="Dropdown" className="arrow-icon" />
        </div>

        <div className="navbar-search-box">
          <input 
            type="text" 
            placeholder="Find Cars, Mobile Phones and more..." 
          />
          <button className="search-btn" aria-label="Search">
            <img src={searchIcon} alt="Search" />
          </button>
        </div>

        <div className="navbar-language">
          <span>ENGLISH</span>
          <img src={arrowIcon} alt="Language dropdown" className="arrow-icon" />
        </div>

        <Link 
          to="/wishlist" 
          className="navbar-wishlist-link" 
          title="Wishlist" 
          aria-label={`Wishlist with ${wishlistCount} items`}
        >
          <div className="navbar-wishlist-icon-wrapper">
            <svg 
              className="navbar-heart-icon" 
              viewBox="0 0 24 24" 
              width="24" 
              height="24"
              aria-hidden="true"
            >
              <path 
                fill={wishlistCount > 0 ? '#ff3f55' : 'none'} 
                stroke={wishlistCount > 0 ? '#ff3f55' : '#002f34'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              />
            </svg>
            {wishlistCount > 0 && (
              <span className="navbar-wishlist-badge" aria-live="polite">
                {wishlistCount}
              </span>
            )}
          </div>
        </Link>

        {currentUser ? (
          <div className="navbar-user-section">
            <span className="navbar-user-email" title={currentUser.email}>
              {currentUser.email.split('@')[0]}
            </span>
            <button onClick={handleLogout} className="navbar-logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="navbar-login-btn">
            Login
          </Link>
        )}

        <Link to="/sell" className="navbar-sell-btn">
          <span className="plus-sign">+</span> SELL
        </Link>
      </nav>

      <div className="navbar-categories">
        <div className="categories-container">
          <span className="all-categories-title">
            ALL CATEGORIES
            <img src={arrowIcon} alt="Categories dropdown" className="arrow-icon" />
          </span>
          <ul className="category-links">
            <li>Cars</li>
            <li>Motorcycles</li>
            <li>Mobile Phones</li>
            <li>For Sale: Houses & Apartments</li>
            <li>Scooters</li>
            <li>Commercial & Other Vehicles</li>
            <li>For Rent: Houses & Apartments</li>
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Navbar
