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
      bubble.style.background = colors[Math.floor(Math.random() * colors.length)] + "33";
      bubblesContainer.appendChild(bubble);
    }
  }

  // ========================
  // 📝 Xử lý đăng ký
  // ========================
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirm = document.getElementById("confirm").value.trim();
      const errorMsg = document.getElementById("errorMsg");

      errorMsg.style.color = "#ef4444";
      errorMsg.textContent = "";

      if (!username || !email || !password || !confirm) {
        errorMsg.textContent = "Vui lòng điền đầy đủ thông tin!";
        return;
      }

      if (password !== confirm) {
        errorMsg.textContent = "Mật khẩu nhập lại không khớp!";
        return;
      }

      try {
        const res = await fetch("https://banhngot.fitlhu.com/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        const text = await res.text();
        console.log("📩 RAW RESPONSE:", text);

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Phản hồi không phải JSON hợp lệ");
        }

        if (!res.ok || !data.success) {
          errorMsg.textContent = data.message || "Đăng ký thất bại!";
          console.error("SERVER ERROR:", data);
          return;
        }

        errorMsg.style.color = "#22c55e";
        errorMsg.textContent = data.message || "Đăng ký thành công 🎉";
        setTimeout(() => (window.location.href = "login.html"), 1500);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        errorMsg.textContent = "Không thể kết nối đến server!";
      }
    });
  }
});
