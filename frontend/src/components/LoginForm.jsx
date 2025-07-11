import React, { useState, useEffect } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../style/LoginForm.css';
import ThreeBackground from './ThreeBackground';

export default function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const API_BASE_URL = import.meta.env.VITE_API_SOURCE;
  const suspiciousPattern = /('|--|;|<script|<img|onerror=|onload=|select\s|insert\s|drop\s|union\s)/i

  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (
      suspiciousPattern.test(formData.username) ||
      suspiciousPattern.test(formData.password)
    ) {
      setError('Nice try with that injection!')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )
      const result = await response.json()
      setLoading(false)

      if (result.status === 'success' && result.userId) {
        login(result.userId)
        navigate('/home')
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <ThreeBackground />
      <div className="login-bg">
        <div className="login-container">
          <div className="login-box">
            <div className="logo-container">
              <span className="app-title">Speech Transcript</span>
            </div>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-box">
                <input
                  type="text"
                  placeholder="Username"
                  name="username"
                  onChange={handleChange}
                  required
                />
                <FaUser className="icon" />
              </div>
              <div className="input-box">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  name="password"
                  onChange={handleChange}
                  onPaste={(e) => e.preventDefault()}
                  required
                />
                <FaLock className="icon" />
                <span
                  className={`toggle-password ${showPassword ? 'visible' : ''}`}
                  onClick={() => setShowPassword((p) => !p)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
              {error && <p className="error">{error}</p>}
              <div className="forgot-password">
                <a onClick={() => navigate('/forgot-password')} className="forgot-password">
                  Forgot Password?
                </a>
              </div>
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            {/* Remove GitHub/LinkedIn section, keep Google if present */}
            <div className="external-login-section">
              <div id="google-signin-button" style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}></div>
            </div>
            <div className="register-link">
              <p>
                Don't have an account?{' '}
                <span onClick={() => navigate('/register')} className="register-text">
                  Register
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
