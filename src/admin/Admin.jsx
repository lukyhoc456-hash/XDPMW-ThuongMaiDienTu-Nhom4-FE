import { useState } from 'react'
import Products from './Products'

const Admin = () => {
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const API_BASE = "https://xdpmw-thuongmaidientu-nhom4-be-1.onrender.com"

  const login = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.message || 'Login failed')
        return
      }
      setToken(data.data?.access_token || '')
      setPassword('')
      setError('')
    } catch (err) {
      setError('Login failed')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken('')
    setEmail('')
    setPassword('')
    setError('')
  }

  return (
    <main className="admin-main px-4 py-4">
      <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
          <div className="d-flex gap-2 flex-wrap align-items-center">
            {/* <span className="badge bg-primary text-white fs-6 py-2 px-3">Products</span> */}
          </div>

          {token ? (
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <span className="badge bg-success text-dark">Admin logged in</span>
              <button className="btn btn-outline-secondary" onClick={logout} type="button">
                Logout
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column flex-lg-row gap-2 align-items-stretch w-100 w-lg-auto admin-login-panel">
              <input
                className="form-control flex-grow-1"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                style={{ minWidth: 0 }}
              />
              <input
                className="form-control flex-grow-1"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                style={{ minWidth: 0 }}
              />
              <button
                className="btn btn-primary btn-signin"
                onClick={login}
                disabled={loading}
                type="button"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          )}
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <Products token={token} />
    </main>
  )
}

export default Admin
