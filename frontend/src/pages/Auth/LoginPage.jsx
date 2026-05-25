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
    e.preventDefault();
    console.log("Dữ liệu chuẩn bị gửi:", formData);

    // GỌI API GỬI THẲNG JSON LUÔN (Không dùng URLSearchParams hay FormData gì sất)
    axios
      .post("http://localhost:8000/login", formData)
      .then((response) => {
        console.log("Đăng nhập thành công:", response.data);
        
        // Tùy theo API trả về, token có thể nằm ở response.data hoặc response.data.data
        const token = response.data.access_token || response.data.data?.access_token || response.data.token;
        
        if(token) {
            localStorage.setItem("token", token);
            window.location.href = "/"; // Về trang chủ
        } else {
            alert("Đăng nhập thành công nhưng không tìm thấy Token!");
        }
      })
      .catch((error) => {
        console.error("Lỗi khi đăng nhập:", error);
        // Nếu ra lỗi 400 ở đây nghĩa là SAI TÀI KHOẢN / MẬT KHẨU
        alert("Sai tài khoản hoặc mật khẩu. Bác check lại xem tk đã đăng ký chưa nhé!");
      });
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />

      <div style={styles.pageBody}>
        <div style={styles.loginContainer}>
          <h2 style={styles.title}>Đăng Nhập</h2>

          <form onSubmit={handleSubmit}>
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

            <button style={styles.btnLogin} type="submit">
              Đăng nhập
            </button>
          </form>

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