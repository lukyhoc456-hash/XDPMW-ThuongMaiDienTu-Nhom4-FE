import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://xdpmw-thuongmaidientu-nhom4-be.onrender.com'
const makeApiUrl = path => `${API_BASE.replace(/\/$/, '')}${path}`
const statusList = ['pending', 'processing', 'shipped', 'completed', 'cancelled']

const blankOrder = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  shipping_address: '',
  notes: '',
  items: [{ product_id: '', quantity: 1 }]
}

export default function Orders({ token }) {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [orderForm, setOrderForm] = useState(blankOrder)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('pending')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const loadOrders = async () => {
    setLoading(true)
    try {
      const url = makeApiUrl('/orders?page=1&page_size=100')
      const response = await fetch(url, { headers })
      const json = await response.json()
      const items = json.items || json.data || (json.data && json.data.data) || []
      setOrders(items)
    } catch (err) {
      console.error(err)
      setMessage('Không tải được danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const url = makeApiUrl('/products?page=1&page_size=100')
      const response = await fetch(url)
      const json = await response.json()
      const items = json.items || json.data || (json.data && json.data.data) || []
      setProducts(items)
    } catch (err) {
      console.error(err)
      setMessage('Không tải được danh sách sản phẩm')
    }
  }

  useEffect(() => {
    loadOrders()
    loadProducts()
  }, [token])

  const viewOrder = async id => {
    setSelected(null)
    setMessage('')
    try {
      const response = await fetch(makeApiUrl(`/orders/${id}`), { headers })
      const json = await response.json()
      const ord = json.data || json
      setSelected(ord)
      setStatus(ord.status)
    } catch (err) {
      console.error(err)
      setMessage('Không tải được chi tiết đơn hàng')
    }
  }

  const updateStatus = async () => {
    if (!selected) return
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(`${API_BASE}/orders/${selected.id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      })
      const json = await response.json()
      if (!response.ok || json.code !== '000') {
        throw new Error(json.message || 'Lỗi cập nhật trạng thái')
      }
      setSelected(json.data)
      await loadOrders()
      setMessage('Cập nhật trạng thái thành công')
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Lỗi cập nhật trạng thái')
    } finally {
      setSaving(false)
    }
  }

  const addItem = () => {
    setOrderForm({ ...orderForm, items: [...orderForm.items, { product_id: '', quantity: 1 }] })
  }

  const updateItem = (index, field, value) => {
    const items = [...orderForm.items]
    items[index] = { ...items[index], [field]: field === 'quantity' ? Number(value) : value }
    setOrderForm({ ...orderForm, items })
  }

  const removeItem = index => {
    const items = [...orderForm.items]
    items.splice(index, 1)
    setOrderForm({ ...orderForm, items })
  }

  const getBackendError = json => {
    if (!json) return 'Lỗi tạo đơn hàng'
    if (json.message) return json.message
    if (json.detail) {
      if (typeof json.detail === 'string') return json.detail
      if (Array.isArray(json.detail)) return json.detail.map(d => d.msg || JSON.stringify(d)).join('; ')
      return JSON.stringify(json.detail)
    }
    return 'Lỗi tạo đơn hàng'
  }

  const createOrder = async () => {
    setSaving(true)
    setMessage('')
    try {
      const payload = {
        customer_name: orderForm.customer_name,
        customer_email: orderForm.customer_email,
        customer_phone: orderForm.customer_phone,
        shipping_address: orderForm.shipping_address,
        notes: orderForm.notes,
        items: orderForm.items.map(item => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })),
      }
      const response = await fetch(makeApiUrl('/orders'), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })
      const json = await response.json()
      if (!response.ok || json.code !== '000') {
        throw new Error(getBackendError(json))
      }
      setMessage('Tạo đơn hàng thành công')
      setOrderForm(blankOrder)
      loadOrders()
      setSelected(json.data)
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Lỗi tạo đơn hàng')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h3>Orders</h3>
      {message && <div style={{ marginBottom: 12, color: message.includes('thành công') ? 'green' : 'red' }}>{message}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
          <h4>Tạo đơn hàng mới</h4>
          <label style={{ display: 'block', marginBottom: 10 }}>
            Tên khách hàng
            <input value={orderForm.customer_name} onChange={e => setOrderForm({ ...orderForm, customer_name: e.target.value })} style={{ width: '100%', padding: 6 }} />
          </label>
          <label style={{ display: 'block', marginBottom: 10 }}>
            Email
            <input value={orderForm.customer_email} onChange={e => setOrderForm({ ...orderForm, customer_email: e.target.value })} style={{ width: '100%', padding: 6 }} />
          </label>
          <label style={{ display: 'block', marginBottom: 10 }}>
            Phone
            <input value={orderForm.customer_phone} onChange={e => setOrderForm({ ...orderForm, customer_phone: e.target.value })} style={{ width: '100%', padding: 6 }} />
          </label>
          <label style={{ display: 'block', marginBottom: 10 }}>
            Shipping address
            <input value={orderForm.shipping_address} onChange={e => setOrderForm({ ...orderForm, shipping_address: e.target.value })} style={{ width: '100%', padding: 6 }} />
          </label>
          <label style={{ display: 'block', marginBottom: 10 }}>
            Notes
            <textarea value={orderForm.notes} onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })} style={{ width: '100%', padding: 6 }} rows={3} />
          </label>
          <div>
            <h5>Items</h5>
            {orderForm.items.map((item, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 10, marginBottom: 8 }}>
                <select value={item.product_id} onChange={e => updateItem(index, 'product_id', e.target.value)} style={{ padding: 6 }}>
                  <option value="">Chọn sản phẩm</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name || `#${p.id}`}</option>
                  ))}
                </select>
                <input type="number" placeholder="Qty" min={1} value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} style={{ padding: 6 }} />
                <button type="button" onClick={() => removeItem(index)}>Remove</button>
              </div>
            ))}
            <button onClick={addItem} type="button">Add item</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={createOrder} disabled={saving}>{saving ? 'Đang tạo...' : 'Tạo đơn hàng'}</button>
          </div>
        </div>

        <div>
          {loading ? (<div>Loading...</div>) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderTop: '1px solid #eee' }}>
                    <td>{o.id}</td>
                    <td>{o.customer_name}</td>
                    <td>{o.customer_phone || '-'}</td>
                    <td>{o.status}</td>
                    <td>{o.total_price}</td>
                    <td><button onClick={() => viewOrder(o.id)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
          {selected ? (
            <>
              <h4>Order #{selected.id}</h4>
              <p><b>Customer:</b> {selected.customer_name}</p>
              <p><b>Email:</b> {selected.customer_email}</p>
              <p><b>Phone:</b> {selected.customer_phone || '-'}</p>
              <p><b>Address:</b> {selected.shipping_address || '-'}</p>
              <p><b>Notes:</b> {selected.notes || '-'}</p>
              <p><b>Status:</b> {selected.status}</p>
              <p><b>Total:</b> {selected.total_price}</p>
              <label style={{ display: 'block', marginBottom: 10 }}>
                Cập nhật trạng thái
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: 6 }}>
                  {statusList.map(value => <option value={value} key={value}>{value}</option>)}
                </select>
              </label>
              <button onClick={updateStatus} disabled={saving}>{saving ? 'Updating...' : 'Update status'}</button>
              <h5 style={{ marginTop: 16 }}>Items</h5>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f0f0f0' }}>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.items || []).map((it, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #eee' }}>
                      <td>{it.product_name || it.product_id}</td>
                      <td>{it.quantity}</td>
                      <td>{it.unit_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div>Select an order to read and update its status</div>
          )}
        </div>
      </div>
    </div>
  )
}
