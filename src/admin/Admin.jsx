import { useState } from 'react'
import Products from './Products'
import Orders from './Orders'

const Admin = () => {
  const [tab, setTab] = useState('products')
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE || 'https://xdpmw-thuongmaidientu-nhom4-be.onrender.com'

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
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button onClick={() => setTab('products')} style={{ marginRight: 8 }}>Products</button>
          <button onClick={() => setTab('orders')}>Orders</button>
        </div>
        {token ? (
          <div>
            <span style={{ marginRight: 12 }}>Admin logged in</span>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ padding: 6 }} />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" style={{ padding: 6 }} />
            <button onClick={login} disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </div>
        )}
      </div>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div>
        {tab === 'products' && <Products token={token} />}
        {tab === 'orders' && <Orders token={token} />}
      </div>
    </div>
  )
}

export default Admin
