import { createContext, useContext, useState, useEffect } from 'react'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

// Custom hook to access wishlist anywhere in the app
export function useWishlist() {
  return useContext(WishlistContext)
}

export function WishlistProvider({ children }) {
  const { currentUser } = useAuth()
  const [wishlist, setWishlist] = useState([])
  const [loadingWishlist, setLoadingWishlist] = useState(false)

  // Synchronize wishlist when user logs in or out
  useEffect(() => {
    if (!currentUser) {
      const timer = setTimeout(() => setWishlist([]), 0)
      return () => clearTimeout(timer)
    }

    // 1. Instantly load local cache so UI is immediate
    const storageKey = `olx_wishlist_${currentUser.uid}`
    try {
      const cached = localStorage.getItem(storageKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        queueMicrotask(() => {
          setWishlist(parsed)
        })
      }
    } catch {
      // Ignore localStorage read errors
    }

    // 2. Listen to Firestore for real-time cloud updates
    const wishlistDocRef = doc(db, 'wishlists', currentUser.uid)

    const unsubscribe = onSnapshot(
      wishlistDocRef,
      (docSnap) => {
        if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
          const cloudItems = docSnap.data().items
          setWishlist(cloudItems)
          try {
            localStorage.setItem(storageKey, JSON.stringify(cloudItems))
          } catch {
            // Ignore localStorage quota errors
          }
        }
        setLoadingWishlist(false)
      },
      (error) => {
        console.warn('Firestore wishlist read notice (using local cache):', error.message)
        setLoadingWishlist(false)
      }
    )

    return () => unsubscribe()
  }, [currentUser])

  // Helper to save wishlist to both localStorage & Firestore
  async function saveWishlist(updatedItems) {
    setWishlist(updatedItems)

    if (!currentUser) return

    const storageKey = `olx_wishlist_${currentUser.uid}`
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedItems))
    } catch {
      // Ignore localStorage quota errors
    }

    try {
      const wishlistDocRef = doc(db, 'wishlists', currentUser.uid)
      await setDoc(wishlistDocRef, {
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        items: updatedItems,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.warn('Firestore write warning:', error.message)
    }
  }

  // Toggle wishlist: if item is already added, remove it; otherwise add it without duplicates
  async function toggleWishlist(product) {
    if (!currentUser || !product?.id) return

    const exists = wishlist.some((item) => item.id === product.id)
    let updated

    if (exists) {
      // Remove item
      updated = wishlist.filter((item) => item.id !== product.id)
    } else {
      // Add item (guaranteeing no duplicate of this id)
      updated = [...wishlist.filter((item) => item.id !== product.id), product]
    }

    await saveWishlist(updated)
  }

  // Check if a specific product id is in the wishlist
  function isInWishlist(productId) {
    if (!productId) return false
    return wishlist.some((item) => item.id === productId)
  }

  // Explicit remove function
  async function removeFromWishlist(productId) {
    if (!currentUser || !productId) return
    const updated = wishlist.filter((item) => item.id !== productId)
    await saveWishlist(updated)
  }

  const value = {
    wishlist,
    loadingWishlist,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

