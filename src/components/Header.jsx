import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Header() {

  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = async () => {
    const token = localStorage.getItem("token");
    // const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const API_URL = "https://xdpmw-thuongmaidientu-nhom4-be.onrender.com";
    if (token) {
      // --- ĐÃ ĐĂNG NHẬP: Gọi API lấy giỏ hàng từ DB ---
      try {
        const response = await fetch(`${API_URL}/cart`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const resData = await response.json();
          const items = resData.data?.items || [];
          const totalItems = items.reduce((total, item) => total + (item.quantity || 0), 0);
          setCartCount(totalItems);
        }
      } catch (error) {
        console.error("Lỗi lấy số lượng giỏ hàng từ DB:", error);
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem("local_cart")) || [];
      const totalItems = localCart.reduce((total, item) => total + (item.quantity || 0), 0);
      setCartCount(totalItems);
    }
  };

  useEffect(() => {
    // Chạy lần đầu khi load trang
    updateCartCount();

    window.addEventListener("cart-updated", updateCartCount);

    // Clean up event listener
    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa token khỏi máy khách
    setIsLoggedIn(false);
    window.location.href = "/"; // Chuyển hướng về trang chủ
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <a className="navbar-brand fw-semibold" href="/">
          Nhom4
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto gap-lg-2">
            <li className="nav-item">
              <a className="nav-link active" href="/">
                Home
              </a>
            </li>
            <li className="nav-item">
              <Link to="/cart" className="nav-link position-relative d-inline-flex align-items-center px-2">
                <span style={{ fontSize: "1.25rem" }}>🛒</span>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                    <span className="visually-hidden">Sản phẩm trong giỏ</span>
                  </span>
                )}
              </Link>
            </li>

            {/* 4. Dùng toán tử ba ngôi để điều kiện hiển thị nút */}
            {!isLoggedIn ? (
              // Nút LOGIN hiển thị khi CHƯA ĐĂNG NHẬP (isLoggedIn === false)
              <li className="nav-item">
                <a className="btn btn-outline-light ms-lg-2" href="/login">
                  Login
                </a>
              </li>
            ) : (
              // Nút LOGOUT hiển thị khi ĐÃ ĐĂNG NHẬP (isLoggedIn === true)
              <li className="nav-item">
                <button
                  className="btn btn-danger ms-lg-2"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
