import { useEffect, useState } from 'react'

//const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'
const API_BASE = "https://xdpmw-thuongmaidientu-nhom4-be.onrender.com";
const makeApiUrl = path => `${API_BASE.replace(/\/$/, '')}${path}`

const blankProduct = {
  id: null,
  name: '',
  description: '',
  category: '',
  image_url: '',
  specifications: '',
  price: 0,
  inventory: 0,
  is_active: true,
}

export default function Products({ token }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(blankProduct)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const url = makeApiUrl('/products?page=1&page_size=100')
      const response = await fetch(url)
      const json = await response.json()
      const items = json.items || json.data || (json.data && json.data.data) || []
      setProducts(items)
    } catch (err) {
      console.error(err)
      setMessage(`Không tải được danh sách sản phẩm: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const startEdit = product => {
    setSelected({
      ...product,
      specifications: typeof product.specifications === 'string' ? product.specifications : (product.specifications ? JSON.stringify(product.specifications, null, 2) : '')
    })
    setMessage('')
  }

  const clearForm = () => {
    setSelected(blankProduct)
    setMessage('')
  }

  const saveProduct = async () => {
    setSaving(true)
    setMessage('')
    try {
      const body = {
        name: selected.name,
        description: selected.description,
        category: selected.category,
        image_url: selected.image_url,
        specifications: selected.specifications,
        price: Number(selected.price),
        inventory: Number(selected.inventory),
        is_active: selected.is_active,
      }
      const method = selected.id ? 'PUT' : 'POST'
      const url = selected.id ? makeApiUrl(`/products/${selected.id}`) : makeApiUrl('/products')
      const response = await fetch(url, { method, headers, body: JSON.stringify(body) })
      const json = await response.json()
      if (!response.ok || json.code !== '000') {
        throw new Error(json.detail || json.message || json.error || 'Lỗi lưu sản phẩm')
      }
      await loadProducts()
      clearForm()
      setMessage('Lưu sản phẩm thành công')
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Lỗi lưu sản phẩm')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async id => {
    if (!window.confirm('Bạn có chắc muốn xoá sản phẩm này?')) return
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(makeApiUrl(`/products/${id}`), { method: 'DELETE', headers })
      const json = await response.json()
      if (!response.ok || json.code !== '000') {
        throw new Error(json.detail || json.message || json.error || 'Lỗi xóa sản phẩm')
      }
      await loadProducts()
      setMessage('Xóa sản phẩm thành công')
      if (selected.id === id) clearForm()
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Lỗi xóa sản phẩm')
    } finally {
      setSaving(false)
    }
  }

  const getImageUrl = url => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    const prefix = API_BASE.replace(/\/$/, '')
    return `${prefix}${url}`
  }

  const uploadImage = async file => {
    if (!file) return
    setImageUploading(true)
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(makeApiUrl('/products/upload-image'), {
        method: 'POST',
        body: formData,
      })
      const json = await response.json()
      if (!response.ok || json.code !== '000') {
        throw new Error(json.message || 'Lỗi upload ảnh')
      }
      setSelected(prev => ({ ...prev, image_url: json.data?.image_url || '' }))
      setMessage('Upload ảnh thành công')
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Lỗi upload ảnh')
    } finally {
      setImageUploading(false)
    }
  }

  const handleImageFileChange = e => {
    const file = e.target.files[0]
    if (file) {
      uploadImage(file)
    }
  }

  return (
    <div>
      <h3>Products</h3>
      {message && <div style={{ marginBottom: 12, color: message.includes('thành công') ? 'green' : 'red' }}>{message}</div>}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ marginBottom: 12, padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
            <h4>{selected.id ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}</h4>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Tên sản phẩm
              <input value={selected.name} onChange={e => setSelected({ ...selected, name: e.target.value })} style={{ width: '100%', padding: 6 }} />
            </label>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Danh mục
              <input value={selected.category} onChange={e => setSelected({ ...selected, category: e.target.value })} style={{ width: '100%', padding: 6 }} />
            </label>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Mô tả
              <textarea value={selected.description} onChange={e => setSelected({ ...selected, description: e.target.value })} rows={3} style={{ width: '100%', padding: 6 }} />
            </label>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Upload ảnh sản phẩm
              <input type='file' accept='image/*' onChange={handleImageFileChange} style={{ width: '100%', padding: 6 }} />
              {imageUploading && <div style={{ marginTop: 8 }}>Đang upload ảnh...</div>}
            </label>
            {selected.image_url && (
              <div style={{ marginBottom: 8 }}>
                <img src={getImageUrl(selected.image_url)} alt='Preview' style={{ maxWidth: '100%', maxHeight: 220, border: '1px solid #ddd', borderRadius: 6 }} />
              </div>
            )}
            <label style={{ display: 'block', marginBottom: 8 }}>
              Specifications
              <textarea value={selected.specifications} onChange={e => setSelected({ ...selected, specifications: e.target.value })} rows={4} style={{ width: '100%', padding: 6 }} />
            </label>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Giá
              <input type="number" value={selected.price} onChange={e => setSelected({ ...selected, price: e.target.value })} style={{ width: '100%', padding: 6 }} />
            </label>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Inventory
              <input type="number" value={selected.inventory} onChange={e => setSelected({ ...selected, inventory: e.target.value })} style={{ width: '100%', padding: 6 }} />
            </label>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Active
              <select value={selected.is_active} onChange={e => setSelected({ ...selected, is_active: e.target.value === 'true' })} style={{ width: '100%', padding: 6 }}>
                <option value={true}>True</option>
                <option value={false}>False</option>
              </select>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveProduct} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
              <button onClick={clearForm} type="button">Reset</button>
            </div>
          </div>
        </div>
        <div style={{ flex: 2, minWidth: 400 }}>
          {loading ? <div>Loading...</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Inv</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td style={{ padding: 4 }}>
                      {p.image_url ? (
                        <img src={getImageUrl(p.image_url)} alt={p.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                      ) : '-'}
                    </td>
                    <td>{p.category || '-'}</td>
                    <td>{p.price}</td>
                    <td>{p.inventory}</td>
                    <td>{String(p.is_active)}</td>
                    <td>
                      <button onClick={() => startEdit(p)} style={{ marginRight: 6 }}>Edit</button>
                      <button onClick={() => deleteProduct(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
