import { useState, useEffect } from "react";

export default function Header() {
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
