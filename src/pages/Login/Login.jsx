import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/symbol.png'
import './Login.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const { login } = useAuth()
  const navigate = useNavigate()

  function validateField(fieldName, value) {
    let error = ''
    if (fieldName === 'email') {
      if (!value.trim()) {
        error = 'Email is required'
      } else if (!EMAIL_REGEX.test(value.trim())) {
        error = 'Please enter a valid email address'
      }
    } else if (fieldName === 'password') {
      if (!value) {
        error = 'Password is required'
      }
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
      const errorMsg = validateField(fieldName, value)
      setErrors((prev) => ({ ...prev, [fieldName]: errorMsg }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setTouched({ email: true, password: true })

    const emailErr = validateField('email', email)
    const passErr = validateField('password', password)

    setErrors({ email: emailErr, password: passErr })

    if (emailErr || passErr) {
      return
    }

    try {
      setGeneralError('')
      setLoading(true)
      await login(email, password)
      navigate('/')
    } catch (err) {
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setGeneralError('Invalid email or password. Please try again.')
      } else {
        setGeneralError('Failed to log in: ' + err.message)
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

        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Log in to your OLX account</p>

        {generalError && <div className="auth-error-alert">{generalError}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
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
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => handleChange('password', e.target.value, setPassword)}
              onBlur={() => handleBlur('password', password)}
              className={touched.password && errors.password ? 'input-error' : ''}
            />
            {touched.password && errors.password && (
              <span className="field-error-msg">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}

export default Login

