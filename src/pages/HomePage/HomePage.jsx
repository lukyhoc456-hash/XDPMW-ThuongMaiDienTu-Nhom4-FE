import React from "react";
import Header from "../../components/Header";
import { useHomePage } from "./HomePage.hook";
import ProductDetailDialog from "../../components/ProductDetailDialog";

export default function HomePage() {
  const {
    BANNERS,
    products,
    filtered,
    categories,
    loading,
    errorMsg,
    query,
    setQuery,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    category,
    setCategory,
    sort,
    setSort,
    formatVND,
    getName,
    getPrice,
    getImage,
    getCategory,
    selectedProduct,
    isDetailOpen,
    openDetail,
    closeDetail,
  } = useHomePage();

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");
    //const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const API_URL = "https://xdpmw-thuongmaidientu-nhom4-be-1.onrender.com";

    if (token) {
      try {
        const response = await fetch(`${API_URL}/cart/add`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ product_id: product.id ?? product._id, quantity: 1 }),
        });
        if (response.ok) {
          window.dispatchEvent(new Event("cart-updated"));
          alert(`Đã thêm ${getName(product)} vào giỏ hàng`);
        } else {
          alert("Lỗi khi thêm vào giỏ hàng trên hệ thống!");
        }
      } catch (error) {
        console.error("Lỗi thêm giỏ hàng:", error);
      }
    } else {
      let localCart = JSON.parse(localStorage.getItem("local_cart")) || [];
      const pId = product.id ?? product._id;
      const itemIndex = localCart.findIndex((i) => i.product_id === pId);
      if (itemIndex > -1) {
        localCart[itemIndex].quantity += 1;
      } else {
        localCart.push({ product_id: pId, quantity: 1, product: product });
      }
      localStorage.setItem("local_cart", JSON.stringify(localCart));
      window.dispatchEvent(new Event("cart-updated"));
      alert(`Đã thêm ${getName(product)} vào giỏ hàng`);
    }
  };

  return (
    <>
      <div className="container py-3">
        <div
          id="homeBannerCarousel"
          className="carousel slide border rounded overflow-hidden bg-light"
          data-bs-ride="carousel"
          data-bs-interval="3500"
        >
          {/* dots */}
          <div className="carousel-indicators">
            {BANNERS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                data-bs-target="#homeBannerCarousel"
                data-bs-slide-to={idx}
                className={idx === 0 ? "active" : ""}
                aria-current={idx === 0 ? "true" : undefined}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* slides */}
          <div className="carousel-inner">
            {BANNERS.map((src, idx) => (
              <div key={src} className={`carousel-item ${idx === 0 ? "active" : ""}`}>
                <div className="ratio ratio-21x9">
                  <img
                    src={src}
                    className="d-block w-100 h-100"
                    alt={`Banner ${idx + 1}`}
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* controls */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#homeBannerCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous</span>
          </button>

          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#homeBannerCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
      <main className="container py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
          <div>
            <h2 className="mb-1">Danh sách sản phẩm</h2>

          </div>

          <div className="card p-3 mb-3 shadow-sm">
            <div className="row gy-2 gx-2 align-items-end">
              <div className="col-12 col-md-4">
                <label className="form-label mb-1">Tìm theo tên</label>
                <input
                  className="form-control"
                  placeholder="Nhập tên sản phẩm..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label mb-1">Giá từ</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label mb-1">Giá đến</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label mb-1">Danh mục</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "Tất cả danh mục" : c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label mb-1">Sắp xếp</label>
                <select
                  className="form-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="default">Mặc định</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading && <div className="alert alert-info">Đang tải sản phẩm...</div>}

        {!loading && errorMsg && (
          <div className="alert alert-danger">
            Lỗi tải dữ liệu: <b>{errorMsg}</b>
          </div>
        )}

        {!loading && !errorMsg && (
          <div className="text-muted mb-3">
            Hiển thị <b>{filtered.length}</b> / <b>{products.length}</b> sản phẩm
          </div>
        )}

        <div className="row g-4">
          {!loading &&
            !errorMsg &&
            filtered.map((p) => (
              <div className="col-12 col-sm-6 col-lg-4" key={p.id ?? p._id}>
                <div className="card h-100 shadow-sm">
                  <div className="ratio ratio-4x3 bg-light">
                    <img
                      src={getImage(p)}
                      alt={getName(p)}
                      className="w-100 h-100"
                      style={{
                        objectFit: "contain",
                        objectPosition: "center",
                        padding: 12,
                      }}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/img/no-image.jpg";
                      }}
                    />
                  </div>

                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div>
                        <h5 className="card-title mb-1">{getName(p)}</h5>
                        <p className="text-muted small mb-0">
                          {p.description ? p.description.slice(0, 80) + (p.description.length > 80 ? "..." : "") : "Chưa có mô tả"}
                        </p>
                      </div>
                      <span className="badge bg-secondary text-uppercase" style={{ fontSize: 11 }}>
                        {getCategory(p)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="fs-5 fw-semibold text-primary">
                        {formatVND(getPrice(p))}
                      </div>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <span className={`badge ${p.inventory > 0 ? "bg-success" : "bg-warning text-dark"}`}>
                          {p.inventory > 0 ? `Còn ${p.inventory}` : "Hết hàng"}
                        </span>
                        <span className={`badge ${p.is_active ? "bg-info text-dark" : "bg-secondary"}`}>
                          {p.is_active ? "Đang bán" : "Ngưng bán"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto d-flex gap-2">
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => openDetail(p)}
                      >
                        Xem chi tiết
                      </button>
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => handleAddToCart(p)}
                      >
                        Thêm giỏ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {!loading && !errorMsg && filtered.length === 0 && (
            <div className="col-12">
              <div className="alert alert-warning mb-0">
                Không có sản phẩm phù hợp.
              </div>
            </div>
          )}
        </div>
      </main>
      <ProductDetailDialog
        open={isDetailOpen}
        product={selectedProduct}
        onClose={closeDetail}
        formatVND={formatVND}
        getImage={getImage}
        getName={getName}
        getCategory={getCategory}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}