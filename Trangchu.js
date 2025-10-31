// ==============================
// 🎃 Little Prince's Bakery
// ==============================
document.addEventListener("DOMContentLoaded", () => {
 const API_URL = "http://localhost:5000/cakes";


  const cakeList = document.getElementById("cakeList");
  const openBtn = document.getElementById("openAddCake");
  const formContainer = document.getElementById("addCakeFormContainer");
  const closeBtn = document.getElementById("closeAddCake");
  const addCakeForm = document.getElementById("addCakeForm");
  const addCakeMsg = document.getElementById("addCakeMsg");

  // 🔹 Các nút login/logout
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Kiểm tra trạng thái đăng nhập
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";
  if (isLoggedIn) {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    logoutBtn.style.display = "none";
  }

  // Khi nhấn logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("token");
    alert("Đã đăng xuất thành công!");
    location.reload();
  });

  // ==========================
  // 📦 Lấy danh sách bánh
  // ==========================
  async function loadCakes() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Lỗi khi tải dữ liệu!");
      const data = await res.json();

      cakeList.innerHTML = "";
      const cakes = data.data || [];

      if (cakes.length === 0) {
        cakeList.innerHTML = "<p>Không có bánh nào 😢</p>";
        return;
      }

      cakes.forEach((cake) => {
  const item = document.createElement("div");
  item.className = "item";
  item.innerHTML = `
    <img src="${cake.image || "https://via.placeholder.com/300x200"}" alt="${cake.name}">
    <h3>${cake.name}</h3>
    <p>${cake.description || "Không có mô tả"}</p>
    <p class="author">👤 Người đăng: ${cake.author || "Ẩn danh 👻"}</p>
    <span class="price">💰 ${cake.price ? cake.price.toLocaleString() : "?"}₫</span>
  `;
  cakeList.appendChild(item);
});

    } catch (err) {
      console.error(err);
      cakeList.innerHTML = "<p style='color:#ff7b00'>Không thể tải danh sách bánh 😭</p>";
    }
  }

  loadCakes();

  // ==========================
  // 🎂 Mở & đóng form thêm bánh
  // ==========================
  openBtn.addEventListener("click", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("⚠️ Vui lòng đăng nhập trước khi thêm bánh!");
    return;
  }
  formContainer.style.display = "flex";
});


  closeBtn.addEventListener("click", () => {
    formContainer.style.display = "none";
  });

  // ==========================
  // 🧁 Thêm bánh mới
  // ==========================
  addCakeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    addCakeMsg.textContent = "";

    const cake = {
  name: document.getElementById("cakeName").value.trim(),
  description: document.getElementById("cakeDesc").value.trim(),
  image: document.getElementById("cakeImage").value.trim(),
  price: parseInt(document.getElementById("cakePrice").value.trim()),
  author: localStorage.getItem("username") || "Ẩn danh 👻"
};



console.log("📤 Gửi bánh lên server:", cake);


    if (!cake.name || !cake.description || !cake.image || !cake.price) {
      addCakeMsg.textContent = "⚠️ Vui lòng nhập đầy đủ thông tin!";
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(cake)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Thêm bánh thất bại!");

      addCakeMsg.style.color = "#22c55e";
      addCakeMsg.textContent = "🎉 Đã thêm bánh mới thành công!";
      formContainer.style.display = "none";

      setTimeout(loadCakes, 1000);
    } catch (err) {
      console.error(err);
      addCakeMsg.textContent = "❌ Không thể gửi dữ liệu lên server!";
    }
  });
});
