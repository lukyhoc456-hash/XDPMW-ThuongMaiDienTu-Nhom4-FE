import React, { useState, useEffect } from "react";
import Header from "../../components/Header";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);

  // 1. Cấu hình chung cho API
  // Tùy theo code login của bác lưu token tên gì thì đổi ở đây nhé (VD: "token" hoặc "access_token")
  const token = localStorage.getItem("token");
  //const API_URL  || "http://localhost:8000";
  const API_URL = "https://xdpmw-thuongmaidientu-nhom4-be.onrender.com";
  // Sửa lại cổng nếu FastAPI của bác chạy cổng khác

  // 2. LẤY DỮ LIỆU GIỎ HÀNG
  const loadCart = async () => {
    if (token) {
      // --- ĐÃ ĐĂNG NHẬP: Lấy từ DB ---
      try {
        const response = await fetch(`${API_URL}/cart`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const resData = await response.json();
          // Backend FastAPI của bác trả về DataResponse có format: { data: [...] }
          setCartItems(resData.data?.items || []);
        }
      } catch (error) {
        console.error("Lỗi lấy giỏ hàng từ DB:", error);
      }
    } else {
      // --- CHƯA ĐĂNG NHẬP: Lấy từ LocalStorage ---
      const localCart = JSON.parse(localStorage.getItem("local_cart")) || [];
      setCartItems(localCart);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // 3. THAY ĐỔI SỐ LƯỢNG (+1 / -1)
  const handleQuantityChange = async (productId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    if (token) {
      // --- ĐÃ ĐĂNG NHẬP: Cập nhật vào DB ---
      try {
        const response = await fetch(`${API_URL}/cart/update`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ product_id: productId, quantity: newQty }),
        });
        if (response.ok) {
          // Cập nhật giao diện (state) trực tiếp để không phải load lại toàn bộ DB
          setCartItems((prevItems) =>
            prevItems.map((item) =>
              item.product_id === productId ? { ...item, quantity: newQty } : item
            )
          );
          window.dispatchEvent(new Event("cart-updated"));
        }
      } catch (error) {
        console.error("Lỗi update số lượng DB:", error);
      }
    } else {
      // --- CHƯA ĐĂNG NHẬP: Cập nhật LocalStorage ---
      let localCart = JSON.parse(localStorage.getItem("local_cart")) || [];
      const item = localCart.find((i) => i.product_id === productId);
      if (item) {
        item.quantity = newQty;
        localStorage.setItem("local_cart", JSON.stringify(localCart));
        setCartItems(localCart);
        window.dispatchEvent(new Event("cart-updated"));
      }
    }
  };

  // 4. XÓA SẢN PHẨM KHỎI GIỎ HÀNG
  const handleRemoveItem = async (productId, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi giỏ hàng không?`)) return;

    if (token) {
      // --- ĐÃ ĐĂNG NHẬP: Xóa trong DB ---
      try {
        const response = await fetch(`${API_URL}/cart/remove/${productId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          // Lọc phần tử vừa xóa ra khỏi danh sách hiển thị
          setCartItems((prevItems) => prevItems.filter((i) => i.product_id !== productId));
          window.dispatchEvent(new Event("cart-updated"));
        } else {
          alert("Lỗi khi xóa sản phẩm trên hệ thống!");
        }
      } catch (error) {
        console.error("Lỗi gọi API xóa:", error);
      }
    } else {
      // --- CHƯA ĐĂNG NHẬP: Xóa ở LocalStorage ---
      let localCart = JSON.parse(localStorage.getItem("local_cart")) || [];
      localCart = localCart.filter((i) => i.product_id !== productId);

      localStorage.setItem("local_cart", JSON.stringify(localCart));
      setCartItems(localCart);
      window.dispatchEvent(new Event("cart-updated"));
    }
  };

  // Các hàm phụ trợ
  const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(n || 0));

  const tongTienGio = () => {
    return cartItems.reduce((total, item) => total + (Number(item.product?.price || 0) * item.quantity), 0);
  };

  // 5. GIAO DIỆN (UI) - Không cần sửa gì ở đây
  return (
    <>
      <Header />
      <main className="container py-5">
        <h2 className="fw-bold mb-4 pb-2 border-bottom">🛒 Chi tiết giỏ hàng</h2>

        {cartItems.length === 0 ? (
          <div className="text-center py-5 border rounded bg-light shadow-sm">
            <p className="text-muted fs-5 mb-3">Giỏ hàng của bạn đang trống rỗng!</p>
            <a href="/" className="btn btn-primary px-4 fw-semibold">Quay lại mua sắm</a>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card shadow-sm p-3">
                {cartItems.map((item, index) => (
                  <div
                    key={item.product_id}
                    className={`row align-items-center g-3 py-3 ${index !== cartItems.length - 1 ? "border-bottom" : ""}`}
                  >
                    <div className="col-3 col-md-2">
                      <div className="ratio ratio-1x1 bg-light rounded border p-1">
                        <img
                          src={item.product?.image_url ? `/img/${item.product.image_url}` : "/img/noimage.jpg"}
                          alt={item.product?.name}
                          style={{ objectFit: "contain" }}
                          onError={(e) => { e.currentTarget.src = "/img/noimage.jpg"; }}
                        />
                      </div>
                    </div>
                    <div className="col-9 col-md-5">
                      <h6 className="fw-bold text-dark mb-1">{item.product?.name || "Sản phẩm"}</h6>
                      <p className="text-muted small mb-1">{item.product?.category || "Danh mục"}</p>
                      <div className="text-danger fw-semibold">{formatVND(item.product?.price)}</div>
                    </div>
                    <div className="col-6 col-md-3 d-flex align-items-center">
                      <div className="input-group input-group-sm" style={{ maxWidth: 100 }}>
                        <button
                          className="btn btn-outline-secondary fw-bold"
                          type="button"
                          onClick={() => handleQuantityChange(item.product_id, item.quantity, -1)}
                        >
                          -
                        </button>
                        <span className="form-control text-center bg-white fw-bold">{item.quantity}</span>
                        <button
                          className="btn btn-outline-secondary fw-bold"
                          type="button"
                          onClick={() => handleQuantityChange(item.product_id, item.quantity, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="col-6 col-md-2 text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveItem(item.product_id, item.product?.name)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm border-0 bg-light p-4">
                <h5 className="fw-bold mb-3 text-dark">Tóm tắt đơn hàng</h5>
                <div className="d-flex justify-content-between mb-2 text-secondary">
                  <span>Số lượng món:</span>
                  <span className="fw-semibold text-dark">
                    {cartItems.reduce((t, i) => t + i.quantity, 0)} sản phẩm
                  </span>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fw-bold text-dark">Tổng tiền:</span>
                  <span className="fs-4 fw-bold text-danger">{formatVND(tongTienGio())}</span>
                </div>
                <button
                  className="btn btn-success w-100 py-2 fw-bold text-uppercase shadow-sm"
                  onClick={() => alert(`Chuẩn bị chuyển hướng sang trang điền thông tin đặt hàng!`)}
                >
                  Tiến hành đặt hàng ➡️
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}