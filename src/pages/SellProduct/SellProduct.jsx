import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import uploadIcon from '../../assets/fileUpload.svg'
import './SellProduct.css'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Client-side image compression to stay well under Firestore's 1MB limit
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calculate aspect ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to compressed JPEG data URL (typically ~50KB-120KB)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

function SellProduct() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // Form input states
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Mobiles')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  
  // Image states: file upload & preview
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageError, setImageError] = useState('')

  // Inline validation states
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState('')

  // Helper function to validate a single field
  function validateField(name, value) {
    let error = ''
    switch (name) {
      case 'title':
        if (!value.trim()) {
          error = 'Title is required'
        } else if (value.trim().length < 5) {
          error = 'Title must be at least 5 characters'
        }
        break
      case 'price':
        if (!value) {
          error = 'Price is required'
        } else if (isNaN(value) || Number(value) <= 0) {
          error = 'Price must be a valid positive number'
        }
        break
      case 'location':
        if (!value.trim()) {
          error = 'Location is required'
        }
        break
      case 'description':
        if (!value.trim()) {
          error = 'Description is required'
        } else if (value.trim().length < 10) {
          error = 'Description must be at least 10 characters'
        }
        break
      case 'image':
        if (!imagePreview) {
          error = 'Product photo is required'
        }
        break
      default:
        break
    }
    return error
  }

  // Handle onBlur for inline error display
  function handleBlur(fieldName, value) {
    setTouched((prev) => ({ ...prev, [fieldName]: true }))
    const errorMsg = validateField(fieldName, value)
    setErrors((prev) => ({ ...prev, [fieldName]: errorMsg }))
  }

  // Handle text input changes and clear error if valid
  function handleInputChange(fieldName, value, setter) {
    setter(value)
    if (touched[fieldName]) {
      const errorMsg = validateField(fieldName, value)
      setErrors((prev) => ({ ...prev, [fieldName]: errorMsg }))
    }
  }

  // Handle File Selection with Automatic Client-Side Compression
  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    setTouched((prev) => ({ ...prev, image: true }))

    if (!file) return

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Please select a valid image file (JPG, PNG, or WebP).')
      setImageFile(null)
      setImagePreview('')
      setErrors((prev) => ({ ...prev, image: 'Please select a valid image file' }))
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setImageError('File size exceeds 5MB limit. Please choose a smaller image.')
      setImageFile(null)
      setImagePreview('')
      setErrors((prev) => ({ ...prev, image: 'Image size exceeds 5MB limit' }))
      return
    }

    try {
      // Compress and resize image to fit safely inside Firestore document (<100KB)
      const compressedDataUrl = await compressImage(file)

      // Clear error
      setImageError('')
      setErrors((prev) => ({ ...prev, image: '' }))
      setImageFile(file)
      setImagePreview(compressedDataUrl)
    } catch (err) {
      console.error('Failed to process image:', err)
      setImageError('Could not process this image. Please try another.')
      setErrors((prev) => ({ ...prev, image: 'Could not process image' }))
    }
  }

  // Remove selected image
  function handleRemoveImage() {
    setImageFile(null)
    setImagePreview('')
    setImageError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (touched.image) {
      setErrors((prev) => ({ ...prev, image: 'Product photo is required' }))
    }
  }

  // Form submission handler
  async function handleSubmit(e) {
    e.preventDefault()

    // Mark all fields as touched to reveal any missing fields
    const allTouched = {
      title: true,
      price: true,
      location: true,
      description: true,
      image: true
    }
    setTouched(allTouched)

    // Run validation across all fields
    const validationErrors = {
      title: validateField('title', title),
      price: validateField('price', price),
      location: validateField('location', location),
      description: validateField('description', description),
      image: !imagePreview ? 'Product photo is required' : ''
    }

    setErrors(validationErrors)

    // Check if there are any errors
    const hasError = Object.values(validationErrors).some((err) => Boolean(err))
    if (hasError) {
      setSubmitError('Please fix the errors below before submitting.')
      return
    }

    try {
      setSubmitError('')
      setLoading(true)

      const newProduct = {
        title: title.trim(),
        category,
        price: Number(price),
        location: location.trim(),
        description: description.trim(),
        image: imagePreview, // Stores local base64 image data URL
        sellerId: currentUser ? currentUser.uid : 'anonymous',
        sellerEmail: currentUser ? currentUser.email : '',
        createdAt: new Date().toISOString(),
        date: 'Today'
      }

      await addDoc(collection(db, 'products'), newProduct)

      setSuccess('Product posted successfully! Redirecting to Home...')
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      console.error('Error adding product:', err)
      setSubmitError(
        'Failed to post product: ' + err.message + 
        '. (Ensure Cloud Firestore is created in your Firebase Console).'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sell-page-wrapper">
      <Navbar />

      <main className="sell-content">
        <div className="sell-card">
          <h2 className="sell-heading">POST YOUR AD</h2>
          <p className="sell-subheading">Enter the details of the item you want to sell</p>

          {submitError && <div className="sell-alert error">{submitError}</div>}
          {success && <div className="sell-alert success">{success}</div>}

          <form onSubmit={handleSubmit} className="sell-form" noValidate>
            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select 
                id="category"
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Mobiles">Mobiles & Tablets</option>
                <option value="Cars">Cars & Commercial</option>
                <option value="Motorcycles">Motorcycles & Scooters</option>
                <option value="Electronics">Electronics & Appliances</option>
                <option value="Computers & Laptops">Computers & Laptops</option>
                <option value="Furniture">Furniture & Decor</option>
                <option value="Hobbies">Books, Sports & Hobbies</option>
                <option value="Fashion">Fashion & Beauty</option>
              </select>
            </div>

            {/* Title */}
            <div className="form-group">
              <label htmlFor="title">Ad Title *</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. iPhone 13 128GB in Mint Condition"
                value={title}
                onChange={(e) => handleInputChange('title', e.target.value, setTitle)}
                onBlur={() => handleBlur('title', title)}
                maxLength={70}
                className={touched.title && errors.title ? 'input-error' : ''}
              />
              {touched.title && errors.title && (
                <span className="field-error-msg">{errors.title}</span>
              )}
              <span className="field-hint">Mention key features (brand, model, age)</span>
            </div>

            {/* Price */}
            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                id="price"
                type="number"
                placeholder="Set a fair price"
                value={price}
                onChange={(e) => handleInputChange('price', e.target.value, setPrice)}
                onBlur={() => handleBlur('price', price)}
                className={touched.price && errors.price ? 'input-error' : ''}
              />
              {touched.price && errors.price && (
                <span className="field-error-msg">{errors.price}</span>
              )}
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Kozhikode, Kerala"
                value={location}
                onChange={(e) => handleInputChange('location', e.target.value, setLocation)}
                onBlur={() => handleBlur('location', location)}
                className={touched.location && errors.location ? 'input-error' : ''}
              />
              {touched.location && errors.location && (
                <span className="field-error-msg">{errors.location}</span>
              )}
            </div>

            {/* Image File Upload & Preview */}
            <div className="form-group">
              <label htmlFor="image-upload">Product Image *</label>

              {/* Upload Drop/Button Box */}
              {!imagePreview ? (
                <div 
                  className={`file-upload-box ${touched.image && (errors.image || imageError) ? 'box-error' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img src={uploadIcon} alt="Upload" className="upload-box-icon" />
                  <p className="upload-box-text">
                    <strong>Click to upload</strong> an image from your device
                  </p>
                  <span className="upload-box-subtext">Supports JPG, PNG, WEBP (Max 5MB - auto-optimized)</span>
                  <input
                    ref={fileInputRef}
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <div className="image-preview-container">
                  <div className="image-preview-card">
                    <img 
                      src={imagePreview} 
                      alt="Uploaded product preview" 
                      className="image-preview-thumbnail" 
                    />
                    <div className="image-preview-info">
                      <span className="image-preview-name">
                        {imageFile?.name || 'Selected image'}
                      </span>
                      <span className="image-preview-size">
                        {imagePreview ? `${Math.round((imagePreview.length * 3 / 4) / 1024)} KB (Optimized)` : 'Local preview'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={handleRemoveImage}
                      title="Remove image and choose another"
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              )}

              {/* File error messages */}
              {imageError && (
                <span className="field-error-msg">{imageError}</span>
              )}
              {touched.image && errors.image && !imageError && (
                <span className="field-error-msg">{errors.image}</span>
              )}
              <span className="field-hint">
                Local preview is generated in your browser before saving your ad.
              </span>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                rows="4"
                placeholder="Include condition, accessories included, reason for selling..."
                value={description}
                onChange={(e) => handleInputChange('description', e.target.value, setDescription)}
                onBlur={() => handleBlur('description', description)}
                className={touched.description && errors.description ? 'input-error' : ''}
              ></textarea>
              {touched.description && errors.description && (
                <span className="field-error-msg">{errors.description}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="sell-submit-btn" 
              disabled={loading}
            >
              {loading ? 'Posting Ad...' : 'Post now'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default SellProduct

