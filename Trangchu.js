// ==============================
// 🎃 Bro’s Spooky Bakery
// ==============================

document.addEventListener("DOMContentLoaded", () => {
 const API_URL = "https://api.allorigins.win/raw?url=https://banhngot.fitlhu.com/api/cakes";

  const cakeList = document.getElementById("cakeList");
  const openBtn = document.getElementById("openAddCake");
  const formContainer = document.getElementById("addCakeFormContainer");
  const closeBtn = document.getElementById("closeAddCake");
  const addCakeForm = document.getElementById("addCakeForm");
  const addCakeMsg = document.getElementById("addCakeMsg");

  // ==========================
  // 📦 Lấy danh sách bánh từ API
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

      cakes.forEach(cake => {
        const item = document.createElement("div");
        item.className = "item";
        item.innerHTML = `
          <img src="${cake.image || "https://via.placeholder.com/300x200"}" alt="${cake.name}">
          <h3>${cake.name}</h3>
          <p>${cake.description || "Không có mô tả"}</p>
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
    formContainer.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    formContainer.style.display = "none";
  });

  // ==========================
  // 🧁 Gửi bánh mới lên server
  // ==========================
  addCakeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    addCakeMsg.textContent = "";

    const cake = {
      name: document.getElementById("cakeName").value.trim(),
      description: document.getElementById("cakeDesc").value.trim(),
      image: document.getElementById("cakeImage").value.trim(),
      price: parseInt(document.getElementById("cakePrice").value.trim())
    };

    if (!cake.name || !cake.description || !cake.image || !cake.price) {
      addCakeMsg.textContent = "⚠️ Vui lòng nhập đầy đủ thông tin!";
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cake)
      });

      const data = await res.json();
      console.log("API Response:", data);

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

