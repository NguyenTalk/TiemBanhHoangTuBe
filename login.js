// ========================
// 🎈 Hiệu ứng bong bóng nước
// ========================
document.addEventListener("DOMContentLoaded", () => {
    const bubblesContainer = document.getElementById("bubbles");
    if (bubblesContainer) {
      const colors = ["#6366f1", "#8b5cf6", "#3b82f6", "#ec4899", "#facc15", "#22c55e"];
      for (let i = 0; i < 15; i++) {
        const bubble = document.createElement("div");
        bubble.classList.add("bubble");
        const size = Math.random() * 100 + 40;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.animationDuration = `${Math.random() * 10 + 10}s`;
        bubble.style.background =
          colors[Math.floor(Math.random() * colors.length)] + "33";
        bubblesContainer.appendChild(bubble);
      }
    }
  
    // ========================
    // 🔐 Xử lý đăng nhập
    // ========================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const errorMsg = document.getElementById("errorMsg");
  
        errorMsg.style.color = "#ef4444";
        errorMsg.textContent = "";
  
        if (!username || !password) {
          errorMsg.textContent = "Vui lòng nhập tên đăng nhập và mật khẩu!";
          return;
        }
  
        try {
          const res = await fetch("https://banhngot.fitlhu.com/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
  
          const data = await res.json();
  
          if (!res.ok || !data.success) {
            errorMsg.textContent = data.message || "Đăng nhập thất bại!";
            console.error("Server error:", data.error || data);
            return;
          }
  
          errorMsg.style.color = "#22c55e";
          errorMsg.textContent = data.message || "Đăng nhập thành công 🎉";
  
          // Lưu token + user info
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("user", JSON.stringify(data.data));
  
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 1200);
        } catch (err) {
          console.error("Fetch error:", err);
          errorMsg.textContent = "Không thể kết nối đến server!";
        }
      });
    }
  });
  