import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, query, limit } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import ProductCard from '../../components/ProductCard/ProductCard'
import './Home.css'

const DEFAULT_PRODUCTS = [
  {
    id: 'mock-1',
    title: 'Apple iPhone 13 (128 GB) - Midnight Blue in Mint Condition',
    price: 38500,
    category: 'Mobiles',
    location: 'Kozhikode, Kerala',
    date: 'Today',
    image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=600&q=75',
    description: 'Battery health 88%. Original box and bill available.'
  },
  {
    id: 'mock-2',
    title: 'Maruti Suzuki Swift VDI 2018 Diesel - Single Owner',
    price: 520000,
    category: 'Cars',
    location: 'Ernakulam, Kerala',
    date: 'Yesterday',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=75',
    description: 'Well maintained, showroom serviced with comprehensive insurance.'
  },
  {
    id: 'mock-3',
    title: 'Yamaha YZF R15 V3 - 2021 Model BS6',
    price: 135000,
    category: 'Motorcycles',
    location: 'Bangalore, Karnataka',
    date: '2 Oct',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=75',
    description: 'Only 14,000 KM driven. Excellent condition with dual channel ABS.'
  },
  {
    id: 'mock-4',
    title: 'Sony PlayStation 5 Disc Edition with 2 DualSense Controllers',
    price: 42000,
    category: 'Electronics',
    location: 'Mumbai, Maharashtra',
    date: '28 Sep',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=75',
    description: 'Comes with 3 games: Spider-Man 2, FIFA 24, and God of War.'
  }
]

function Home() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const navigate = useNavigate()

  useEffect(() => {

    const q = query(collection(db, 'products'), limit(30))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const firestoreList = []
        querySnapshot.forEach((doc) => {
          firestoreList.push({
            id: doc.id,
            ...doc.data()
          })
        })

        if (firestoreList.length > 0) {
          setProducts([...firestoreList, ...DEFAULT_PRODUCTS])
        }
      },
      (error) => {
        console.warn('Firestore real-time read warning:', error.message)
      }
    )

    return () => unsubscribe()
  }, [])

  const handleProductClick = (productId, productItem) => {
    navigate(`/product/${productId}`, { state: { product: productItem } })
  }

  return (
    <div className="home-container">

      <Navbar />

      <main className="home-content">
    
        <div className="home-banner">
          <div className="banner-text">
            <h1>Buy & Sell Anything Near You</h1>
            <p>From cars and mobiles to furniture and electronics.</p>
          </div>
        </div>

        <section className="recommendations-section">
          <h2 className="section-title">Fresh recommendations</h2>

          <div className="products-grid">
            {products.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleProductClick(item.id, item)}
                className="product-card-clickable"
              >
                <ProductCard product={item} />
              </div>
            ))}
          </div>

          <div className="load-more-wrapper">
            <button className="load-more-btn">
              Load more
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home
