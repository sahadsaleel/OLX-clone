import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/symbol.png'
import './Signup.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)

  // Inline validation state
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const { signup } = useAuth()
  const navigate = useNavigate()

  // Validate single field
  function validateField(fieldName, value, currentPassword = password) {
    let error = ''
    switch (fieldName) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required'
        } else if (!EMAIL_REGEX.test(value.trim())) {
          error = 'Please enter a valid email address'
        }
        break
      case 'password':
        if (!value) {
          error = 'Password is required'
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters'
        }
        break
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password'
        } else if (value !== currentPassword) {
          error = 'Passwords do not match'
        }
        break
      default:
        break
    }
    return error
  }

  function handleBlur(fieldName, value) {
    setTouched((prev) => ({ ...prev, [fieldName]: true }))
    const errorMsg = validateField(fieldName, value)
    setErrors((prev) => ({ ...prev, [fieldName]: errorMsg }))
  }

  function handleChange(fieldName, value, setter) {
    setter(value)
    if (touched[fieldName]) {
      const errorMsg = validateField(fieldName, value, fieldName === 'confirmPassword' ? password : value)
      setErrors((prev) => ({ ...prev, [fieldName]: errorMsg }))
    }
    // Also re-validate confirmPassword if user changes password
    if (fieldName === 'password' && touched.confirmPassword) {
      const confirmErr = validateField('confirmPassword', confirmPassword, value)
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Mark all fields touched
    setTouched({ email: true, password: true, confirmPassword: true })

    const emailErr = validateField('email', email)
    const passErr = validateField('password', password)
    const confirmErr = validateField('confirmPassword', confirmPassword, password)

    const currentErrors = {
      email: emailErr,
      password: passErr,
      confirmPassword: confirmErr
    }
    setErrors(currentErrors)

    if (emailErr || passErr || confirmErr) {
      return
    }

    try {
      setGeneralError('')
      setLoading(true)
      await signup(email, password)
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setGeneralError('This email is already registered. Please login.')
      } else if (err.code === 'auth/invalid-email') {
        setGeneralError('Invalid email address.')
      } else {
        setGeneralError('Failed to create an account: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <Link to="/">
            <img src={logo} alt="OLX Logo" />
          </Link>
        </div>

        <h2>Create an Account</h2>
        <p className="auth-subtitle">Join OLX to buy and sell easily</p>

        {generalError && <div className="auth-error-alert">{generalError}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value, setEmail)}
              onBlur={() => handleBlur('email', email)}
              className={touched.email && errors.email ? 'input-error' : ''}
            />
            {touched.email && errors.email && (
              <span className="field-error-msg">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChange={(e) => handleChange('password', e.target.value, setPassword)}
              onBlur={() => handleBlur('password', password)}
              className={touched.password && errors.password ? 'input-error' : ''}
            />
            {touched.password && errors.password && (
              <span className="field-error-msg">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value, setConfirmPassword)}
              onBlur={() => handleBlur('confirmPassword', confirmPassword)}
              className={touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <span className="field-error-msg">{errors.confirmPassword}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer-link">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  )
}

export default Signup

