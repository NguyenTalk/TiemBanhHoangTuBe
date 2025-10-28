// ==============================
// 🎃 Bro’s Spooky Bakery – API Connect
// ==============================

document.addEventListener("DOMContentLoaded", async () => {
    const menuContainer = document.querySelector(".menu-grid");
    const errorBox = document.createElement("p");
    errorBox.style.color = "#ff7b00";
    errorBox.style.marginTop = "10px";
  
    try {
      const res = await fetch("https://banhngot.fitlhu.com/api/cakes");
      if (!res.ok) throw new Error(`Lỗi kết nối API (${res.status})`);
  
      const data = await res.json();
      console.log("🎂 Dữ liệu nhận từ API:", data);
  
      // Kiểm tra dữ liệu trả về
      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error("Phản hồi API không đúng định dạng mong đợi.");
      }
  
      // Xóa bánh cũ, hiển thị bánh mới
      menuContainer.innerHTML = "";
  
      data.data.forEach((cake) => {
        const item = document.createElement("div");
        item.classList.add("item");
  
        item.innerHTML = `
          <img src="${cake.image || 'https://images.unsplash.com/photo-1608198093002-de6bd7c35507'}" alt="${cake.name}">
          <h3>${cake.name || 'Bánh ngọt không tên'}</h3>
          <p>${cake.description || 'Một chiếc bánh ngọt tuyệt vời đến từ Bro’s Bakery.'}</p>
          ${cake.price ? `<span class="price">💰 ${cake.price}₫</span>` : ""}
        `;
  
        menuContainer.appendChild(item);
      });
    } catch (err) {
      console.error("❌ Lỗi khi lấy dữ liệu bánh:", err);
      errorBox.textContent = "Không thể tải danh sách bánh từ server 😭";
      menuContainer.after(errorBox);
    }
  });
  