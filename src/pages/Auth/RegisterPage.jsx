import { useState } from "react";
import Header from "../../components/Header";
import axios from "axios";

const RegisterPage = () => {
  // 1. Tạo state để lưu trữ toàn bộ thông tin đăng ký
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // State để hiển thị thông báo lỗi nếu mật khẩu không khớp
  const [error, setError] = useState("");

  // 2. Hàm xử lý thay đổi giá trị trong các ô input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 3. Hàm xử lý khi người dùng nhấn nút Đăng Ký
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Reset lại lỗi cũ trước khi kiểm tra

    // Kiểm tra xem mật khẩu nhập lại có khớp không
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    console.log("Dữ liệu đăng ký gửi lên Backend FastAPI:", formData);

    // TODO: Thêm logic gọi API đăng ký tại đây
    axios
      .post("https://xdpmw-thuongmaidientu-nhom4-be-1.onrender.com/register", formData)
      .then((response) => {
        console.log("Đăng ký thành công:", response.data);
        // Xử lý kết quả thành công, ví dụ: chuyển hướng đến trang đăng nhập
        window.location.href = "/login";
      })
      .catch((error) => {
        console.error("Lỗi khi đăng ký:", error);
        setError("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.");
      });
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* Giữ nguyên Header của bạn ở trên cùng */}
      <Header />

      {/* Phần thân chứa Form đăng ký */}
      <div style={styles.pageBody}>
        <div style={styles.registerContainer}>
          <h2 style={styles.title}>Đăng Ký Tài Khoản</h2>

          {/* Hiển thị thông báo lỗi nếu có */}
          {error && <div style={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Ô nhập Họ và Tên */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="fullName">
                Họ và tên
              </label>
              <input
                style={styles.input}
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Nhập họ và tên của bạn"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Ô nhập Email */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="email">
                Địa chỉ Email
              </label>
              <input
                style={styles.input}
                type="email"
                id="email"
                name="email"
                placeholder="example@gmail.com"
                value={formData.email}
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
                placeholder="Tạo mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Ô nhập lại Mật khẩu */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="confirmPassword">
                Xác nhận mật khẩu
              </label>
              <input
                style={styles.input}
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Nút Đăng ký */}
            <button style={styles.btnRegister} type="submit">
              Đăng ký
            </button>
          </form>

          {/* Liên kết quay lại đăng nhập */}
          <div style={styles.formFooter}>
            <p>
              Đã có tài khoản?{" "}
              <a href="/login" style={styles.link}>
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Style đồng bộ với trang Login nhưng tối ưu kích thước cho nhiều ô nhập hơn
const styles = {
  pageBody: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    padding: "40px 20px", // Tăng padding dọc phòng trường hợp màn hình nhỏ
  },
  registerContainer: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "450px", // Rộng hơn form login một chút để nhìn thoáng hơn
  },
  title: {
    textAlign: "center",
    marginBottom: "24px",
    color: "#333",
    fontSize: "24px",
    fontWeight: "600",
  },
  errorAlert: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "20px",
    fontSize: "14px",
    textAlign: "center",
    border: "1px solid #f5c6cb",
  },
  inputGroup: {
    marginBottom: "18px",
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
  btnRegister: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#28a745", // Đổi sang màu xanh lá cây để phân biệt với nút Đăng nhập
    border: "none",
    borderRadius: "4px",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
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

export default RegisterPage;
