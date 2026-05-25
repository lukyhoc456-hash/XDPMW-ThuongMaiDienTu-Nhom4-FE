import { useState } from "react";
import Header from "../../components/Header";
import axios from "axios";

const LoginPage = () => {
  // 1. Tạo state để lưu trữ dữ liệu người dùng nhập
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // 2. Hàm xử lý thay đổi giá trị trong các ô input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 3. Hàm xử lý khi người dùng nhấn nút Đăng Nhập
  const handleSubmit = (e) => {
    e.preventDefault(); // Chặn việc reload lại trang mặc định của form
    console.log("Dữ liệu gửi lên Backend FastAPI:", formData);

    // TODO: Thêm logic gọi API (fetch hoặc axios) tới Backend ở đây
    axios
      .post("http://localhost:8000/login", formData)
      .then((response) => {
        console.log("Đăng nhập thành công:", response.data);
        // Lưu token vào localStorage để giữ trạng thái đăng nhập
        localStorage.setItem("token", response.data.token);
        window.location.href = "/"; // Xử lý kết quả thành công, ví dụ: chuyển hướng đến trang chủ
        // Xử lý kết quả thành công, ví dụ: chuyển hướng đến trang chủ
      })
      .catch((error) => {
        console.error("Lỗi khi đăng nhập:", error);
        // Xử lý lỗi, ví dụ: hiển thị thông báo lỗi cho người dùng
      });
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* Giữ nguyên Header của bạn ở trên cùng */}
      <Header />

      {/* Phần thân chứa Form đăng nhập */}
      <div style={styles.pageBody}>
        <div style={styles.loginContainer}>
          <h2 style={styles.title}>Đăng Nhập</h2>

          <form onSubmit={handleSubmit}>
            {/* Ô nhập Tài khoản */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="username">
                Tài khoản hoặc Email
              </label>
              <input
                style={styles.input}
                type="text"
                id="username"
                name="username"
                placeholder="Nhập tài khoản của bạn"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* Ô nhập Mật khẩu */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="password">
                Mật khẩu
              </label>
              <input
                style={styles.input}
                type="password"
                id="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Nút Đăng nhập */}
            <button style={styles.btnLogin} type="submit">
              Đăng nhập
            </button>
          </form>

          {/* Liên kết mở rộng */}
          <div style={styles.formFooter}>
            <p>
              Chưa có tài khoản?{" "}
              <a href="/register" style={styles.link}>
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Định nghĩa Inline Styles để gom gọn trong một file (Bạn có thể tách ra file .css riêng nếu muốn)
const styles = {
  pageBody: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    padding: "20px",
  },
  loginContainer: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(250, 34, 11, 0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    textAlign: "center",
    marginBottom: "24px",
    color: "#333",
    fontSize: "24px",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#666",
    fontSize: "14px",
    textAlign: "left",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#333333",
  },
  btnLogin: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "4px",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  formFooter: {
    marginTop: "16px",
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
  },
};

export default LoginPage;
