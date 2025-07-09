import React, { useState, useEffect } from 'react'
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import '../style/RegisterForm.css'

import logo from '../assets/logo.png'
import github from '../assets/Github.png'
import linkedin from '../assets/LinkedIn.png'
import ThreeBackground from './ThreeBackground';

export default function RegisterForm() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const API_BASE_URL = import.meta.env.VITE_API_SOURCE
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
  const suspiciousPattern = /('|--|;|<script|<img|onerror=|onload=|select\s|insert\s|drop\s|union\s)/i

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Password rules state
  const [pwRules, setPwRules] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  })

  // Google sign-in
  useEffect(() => {
    /* global google */
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      })
      window.google.accounts.id.renderButton(
        document.getElementById('google-signup-button'),
        {
          type: 'icon',
          shape: 'circle',
          theme: 'outline',
          size: 'large',
        }
      )
    }
  }, [GOOGLE_CLIENT_ID])

  async function handleGoogleResponse(response) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/backend/api/Auth/google_callback.php`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: response.credential }),
        }
      )
      const data = await res.json()
      if (data.status === 'success' && data.userId) {
        login(data.userId)
        navigate('/home')
      } else {
        setErrors(data.message || 'Google signup failed')
      }
    } catch (err) {
      console.error(err)
      setErrors('Google signup error')
    }
  }

  // track pw rules live
  useEffect(() => {
    const pw = formData.password
    setPwRules({
      length: pw.length >= 8,
      uppercase: /[A-Z]/.test(pw),
      number: /\d/.test(pw),
      special: /[!@#$%^&*]/.test(pw),
    })
  }, [formData.password])

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors('')
    setLoading(true)

    // basic injection guard
    for (let k of ['username','email','password']) {
      if (suspiciousPattern.test(formData[k])) {
        setErrors('Invalid characters detected')
        setLoading(false)
        return
      }
    }

    // password match
    if (formData.password !== formData.confirmPassword) {
      setErrors('Passwords do not match')
      setLoading(false)
      return
    }
    // all rules pass?
    if (!Object.values(pwRules).every(Boolean)) {
      setErrors('Password does not meet requirements')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/backend/api/Auth/register.php`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        }
      )
      const data = await res.json()
      setLoading(false)
      if (data.status === 'success' && data.userId) {
        login(data.userId)
        navigate('/home')
      } else {
        setErrors(data.message || 'Signup failed')
      }
    } catch (err) {
      console.error(err)
      setErrors('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <ThreeBackground />
      <div className="register-bg">
        <div className="register-container">
          <div className="register-box">
            <div className="logo-container">
              <span className="app-title">Speech Transcript</span>
            </div>
            <h2 className="register-title">Create Your Account</h2>
            <form onSubmit={handleSubmit} className="register-form">
              <div className="input-box">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  onChange={handleChange}
                  required
                />
                <FaUser className="icon" />
              </div>
              <div className="input-box">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  required
                />
                <FaEnvelope className="icon" />
              </div>
              <div className="input-box password-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
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

                <div className="password-requirements">
                  <p className={pwRules.length ? 'valid' : 'invalid'}>
                    <span className="icon">{pwRules.length ? '✔' : '✖'}</span>
                    At least 8 characters
                  </p>
                  <p className={pwRules.uppercase ? 'valid' : 'invalid'}>
                    <span className="icon">{pwRules.uppercase ? '✔' : '✖'}</span>
                    One uppercase letter
                  </p>
                  <p className={pwRules.number ? 'valid' : 'invalid'}>
                    <span className="icon">{pwRules.number ? '✔' : '✖'}</span>
                    One number
                  </p>
                  <p className={pwRules.special ? 'valid' : 'invalid'}>
                    <span className="icon">{pwRules.special ? '✔' : '✖'}</span>
                    One special char (!@#$%^&*)
                  </p>
                </div>
              </div>
              <div className="input-box">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  required
                />
                <FaLock className="icon" />
              </div>
              {errors && <p className="error">{errors}</p>}
              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? 'Signing Up...' : 'Register'}
              </button>
            </form>
            {/* Remove GitHub/LinkedIn section, keep Google if present */}
            <div className="external-sign-in">
              <div id="google-signup-button" style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}></div>
            </div>

            <div className="login-separator"></div>
            <div className="login-link">
              <p>
                Already have an account?{' '}
                <span onClick={() => navigate('/login')} className="login-text">
                  Sign In
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
