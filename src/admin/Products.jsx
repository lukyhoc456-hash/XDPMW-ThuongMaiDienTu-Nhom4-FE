import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../adminConfig.js'

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
  const [searchName, setSearchName] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const loadProducts = async ({ minPrice: filterMinPrice = minPrice, maxPrice: filterMaxPrice = maxPrice } = {}) => {
    setLoading(true)
    try {
      let url = makeApiUrl('/products?page=1&page_size=100')
      if (filterMinPrice !== '') url += `&min_price=${encodeURIComponent(filterMinPrice)}`
      if (filterMaxPrice !== '') url += `&max_price=${encodeURIComponent(filterMaxPrice)}`
      const response = await fetch(url)
      const json = await response.json()
      const items = json.items || json.data || (json.data && json.data.data) || []
      console.log(items)
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

  const validateProduct = () => {
    if (imageUploading) {
      setMessage('Vui lòng chờ upload ảnh hoàn tất trước khi lưu sản phẩm.')
      return false
    }

    const requiredFields = [
      { value: selected.name, label: 'Tên sản phẩm' },
      { value: selected.category, label: 'Danh mục' },
      { value: selected.description, label: 'Mô tả' },
      { value: selected.image_url, label: 'Ảnh sản phẩm' },
      { value: selected.specifications, label: 'Thông số' },
      { value: selected.price, label: 'Giá' },
      { value: selected.inventory, label: 'Tồn kho' },
    ]

    for (const field of requiredFields) {
      if (field.value === null || field.value === undefined || String(field.value).trim() === '') {
        setMessage(`Vui lòng nhập ${field.label}.`)
        return false
      }
    }

    if (Number.isNaN(Number(selected.price)) || Number(selected.price) < 0) {
      setMessage('Giá phải là một số hợp lệ và không được âm.')
      return false
    }

    if (!Number.isInteger(Number(selected.inventory)) || Number(selected.inventory) < 0) {
      setMessage('Tồn kho phải là một số nguyên hợp lệ và không được âm.')
      return false
    }

    return true
  }

  const saveProduct = async () => {
    if (!validateProduct()) {
      return
    }

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
    if (!url) return '/img/noimage.jpg'
    const raw = String(url).trim().replaceAll('\\', '/')
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    if (raw.startsWith('img/')) return `/${raw}`
    if (raw.startsWith('/img/')) return raw
    if (raw.startsWith('/static/')) return raw
    if (raw.startsWith('static/')) return `/${raw}`
    if (raw.startsWith('uploads/')) return `${API_BASE.replace(/\/$/, '')}/${raw}`
    return `${API_BASE.replace(/\/$/, '')}/static/uploads/${raw}`
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const name = String(product.name || product.title || product.ten || product.description || '')
        .toLowerCase()
      const price = Number(product.price ?? product.unit_price ?? product.gia ?? product.cost ?? 0)

      if (searchName.trim()) {
        if (!name.includes(searchName.trim().toLowerCase())) return false
      }

      if (minPrice !== '') {
        const min = Number(minPrice)
        if (!Number.isNaN(min) && price < min) return false
      }

      if (maxPrice !== '') {
        const max = Number(maxPrice)
        if (!Number.isNaN(max) && price > max) return false
      }

      return true
    })
  }, [products, searchName, minPrice, maxPrice])

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
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="mb-1 text-dark">Sản phẩm</h3>
          {/* <p className="text-muted mb-0">Quản lý sản phẩm, tìm kiếm và lọc nhanh bằng Bootstrap.</p> */}
        </div>
        <button className="btn btn-outline-primary" onClick={loadProducts}>
          Tải lại danh sách
        </button>
      </div>

      <div className="card bg-light border-0 mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label text-muted">Tìm theo tên</label>
              <input
                className="form-control"
                placeholder="Nhập tên sản phẩm"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label text-muted">Giá min</label>
              <input
                className="form-control"
                placeholder="0"
                type="number"
                min="0"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label text-muted">Giá max</label>
              <input
                className="form-control"
                placeholder="0"
                type="number"
                min="0"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-2">
              <button className="btn btn-primary w-100" onClick={loadProducts}>
                Lọc
              </button>
            </div>
            <div className="col-12 col-md-2 d-grid">
              <button
                className="btn btn-outline-secondary w-100"
                type="button"
                onClick={() => {
                  setSearchName('')
                  setMinPrice('')
                  setMaxPrice('')
                  loadProducts({ minPrice: '', maxPrice: '' })
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-danger'} py-2`} role="alert">
          {message}
        </div>
      )}

      <div className="row gx-4 gy-4">
        <div className="col-12 col-xl-4">
          <div className="card bg-white border-0 h-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-dark">{selected.id ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}</h4>
              <p className="text-muted">Điền thông tin sản phẩm để lưu hoặc cập nhật.</p>

              <div className="mb-3">
                <label className="form-label text-muted">Tên sản phẩm</label>
                <input
                  className="form-control"
                  value={selected.name}
                  onChange={e => setSelected({ ...selected, name: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted">Danh mục</label>
                <input
                  className="form-control"
                  value={selected.category}
                  onChange={e => setSelected({ ...selected, category: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted">Mô tả</label>
                <textarea
                  className="form-control"
                  value={selected.description}
                  onChange={e => setSelected({ ...selected, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted">Upload ảnh sản phẩm</label>
                <input
                  className="form-control"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                />
                {imageUploading && <div className="text-muted mt-2">Đang upload ảnh...</div>}
              </div>

              {selected.image_url && (
                <div className="mb-3">
                  <img
                    src={getImageUrl(selected.image_url)}
                    alt="Preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: 220, objectFit: 'contain' }}
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label text-muted">Thông số</label>
                <textarea
                  className="form-control"
                  value={selected.specifications}
                  onChange={e => setSelected({ ...selected, specifications: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label text-muted">Giá</label>
                  <input
                    className="form-control"
                    type="number"
                    value={selected.price}
                    onChange={e => setSelected({ ...selected, price: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-muted">Tồn kho</label>
                  <input
                    className="form-control"
                    type="number"
                    value={selected.inventory}
                    onChange={e => setSelected({ ...selected, inventory: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted">Trạng thái</label>
                <select
                  className="form-select"
                  value={selected.is_active}
                  onChange={e => setSelected({ ...selected, is_active: e.target.value === 'true' })}
                >
                  <option value={true}>True</option>
                  <option value={false}>False</option>
                </select>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-success flex-grow-1" onClick={saveProduct} disabled={saving || imageUploading}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button className="btn btn-outline-secondary flex-grow-1" onClick={clearForm} type="button">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="card bg-white border-0 h-100 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="card-title text-dark mb-0">Danh sách sản phẩm</h4>
                <span className="badge bg-info text-dark">{filteredProducts.length} / {products.length}</span>
              </div>

              {loading ? (
                <div className="text-dark">Loading...</div>
              ) : (
                <div className="table-responsive text-nowrap">
                  <table className="table table-bordered table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Ảnh</th>
                        <th>Loại</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(p => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{p.name}</td>
                          <td style={{ width: 90 }}>
                            {p.image_url ? (
                              <img
                                src={getImageUrl(p.image_url)}
                                alt={p.name}
                                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10 }}
                                onError={(e) => { e.currentTarget.src = '/img/noimage.jpg' }}
                              />
                            ) : '-'}
                          </td>
                          <td>{p.category || '-'}</td>
                          <td>{p.price?.toLocaleString('vi-VN') || 0}</td>
                          <td>{p.inventory}</td>
                          <td>
                            <span className={`badge ${p.is_active ? 'bg-success' : 'bg-secondary'}`}>
                              {p.is_active ? 'Đang bán' : 'Ngưng bán'}
                            </span>
                          </td>
                          <td className="align-middle text-center">
                            <div className="d-flex justify-content-center gap-2 flex-wrap">
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(p)}>
                                Sửa
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => deleteProduct(p.id)}>
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
