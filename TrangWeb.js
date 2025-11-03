document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("⚠️ Bạn cần đăng nhập trước!");
    window.location.href = "index.html";
  }

  const menuItems = document.querySelectorAll(".menu-item");
  const introText = document.querySelector(".intro-text");
  const cakeList = document.getElementById("cakeList");
  const formContainer = document.getElementById("formContainer");
  const logoutBtn = document.getElementById("logoutBtn");

  // ======================
  // HÀM FETCH CHUNG
  // ======================
  async function fetchJSON(url, options = {}) {
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Lỗi API");
      }
      return data;
    } catch (err) {
      console.error("❌ Fetch error:", err);
      throw err;
    }
  }

  // ======================
  // MENU SỰ KIỆN
  // ======================
  menuItems.forEach((item) => {
    item.addEventListener("click", async (e) => {
      e.preventDefault();
      const action = item.dataset.action;

      introText.textContent = "";
      cakeList.innerHTML = "";
      formContainer.innerHTML = "";

      try {
        switch (action) {
          case "all":
            await showAllCakes();
            break;
          case "my":
            await showMyCakes();
            break;
          case "categories":
            await showCategories();
            break;
          case "search":
            showSearchForm();
            break;
          case "create":
            await showCreateForm();
            break;
          case "update":
            showUpdateForm();
            break;
          case "delete":
            showDeleteForm();
            break;
          default:
            introText.textContent = "⚠️ Chức năng chưa được hỗ trợ!";
        }
      } catch (err) {
        introText.textContent = "❌ " + err.message;
      }
    });
  });

  // ======================
  // HIỂN THỊ DANH SÁCH BÁNH
  // ======================
  function renderCakes(cakes) {
    if (!cakes || cakes.length === 0) {
      cakeList.innerHTML = "<p>Không có bánh nào để hiển thị!</p>";
      return;
    }

    cakeList.innerHTML = cakes
      .map(
        (cake) => `
        <div class="cake-card" data-id="${cake.id || ''}">
          <img src="${cake.image || "https://via.placeholder.com/300x200"}" alt="${cake.name}" />
          <h3>${cake.name}</h3>
          <p class="cake-id">🆔 ID: <span>${cake.id || "Không xác định"}</span></p>
          <p>${cake.description || "Không có mô tả."}</p>
          <p class="cake-category">📦 Loại: ${cake.category || "Chưa rõ"}</p>
          <p class="cake-price">💰 ${cake.price ? cake.price.toLocaleString() : "?"}₫</p>
          <p class="cake-author">👤 ${cake.author || "Ẩn danh"}</p>
        </div>`
      )
      .join("");
  }

  // ======================
  // HIỂN THỊ TẤT CẢ BÁNH
  // ======================
  async function showAllCakes() {
    introText.textContent = "📋 Danh sách tất cả bánh:";
    const data = await fetchJSON("https://banhngot.fitlhu.com/api/cakes");
    renderCakes(data.data);
  }

  // ======================
  // HIỂN THỊ BÁNH CỦA NGƯỜI DÙNG
  // ======================
  async function showMyCakes() {
    introText.textContent = "🧁 Danh sách bánh của bạn:";
    const data = await fetchJSON("https://banhngot.fitlhu.com/api/cakes/my", {
      headers: { Authorization: `Bearer ${token}` },
    });
    renderCakes(data.data);
  }

  // ======================
  // DANH MỤC BÁNH
  // ======================
  async function showCategories() {
    introText.textContent = "📂 Danh mục bánh:";
    const data = await fetchJSON("https://banhngot.fitlhu.com/api/cakes/categories/list");
    const categories = data.data;
    cakeList.innerHTML = categories
      .map(
        (cat) => `
        <div class="cake-card">
          <h3>🍰 ${cat.category}</h3>
          <p>Số lượng: ${cat.count}</p>
        </div>`
      )
      .join("");
  }

  // ======================
  // TÌM KIẾM BÁNH (DỰA TRÊN MẪU API)
  // ======================
 function showSearchForm() {
  introText.textContent = "🔍 Tìm kiếm bánh (theo tên, loại hoặc mô tả):";
  formContainer.innerHTML = `
    <div class="form-card">
      <label>Từ khóa:</label>
      <input id="searchKey" placeholder="Nhập tên, loại bánh hoặc mô tả..." />
      <label>Giá tối thiểu (VNĐ):</label>
      <input id="minPrice" type="number" placeholder="Ví dụ: 10000" />
      <label>Giá tối đa (VNĐ):</label>
      <input id="maxPrice" type="number" placeholder="Ví dụ: 100000" />
      <label>Sắp xếp theo:</label>
      <select id="sortOrder">
        <option value="">-- Không sắp xếp --</option>
        <option value="price_asc">Giá tăng dần</option>
        <option value="price_desc">Giá giảm dần</option>
        <option value="name_asc">Tên (A→Z)</option>
        <option value="name_desc">Tên (Z→A)</option>
        <option value="created_at_desc">Mới nhất</option>
      </select>
      <button id="searchBtn">Tìm kiếm</button>
    </div>
  `;

  // Bỏ dấu tiếng Việt & lower-case để fallback
  const normalizeVi = (s) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();

  // Hàm gọi API search
  const callSearch = async (q, opts = {}) => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (opts.minPrice) params.append("minPrice", opts.minPrice);
    if (opts.maxPrice) params.append("maxPrice", opts.maxPrice);
    if (opts.sort) params.append("sort", opts.sort);
    // có/không cần phân trang thì tùy; thêm mặc định cho ổn định
    params.append("page", opts.page || 1);
    params.append("limit", opts.limit || 10);

    const url = `https://banhngot.fitlhu.com/api/cakes/search?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // nhiều endpoint yêu cầu token
      },
    });
    const data = await res.json();
    console.log("🔎 API URL:", url);
    console.log("📦 API Response:", data);
    if (!res.ok || data.success === false) {
      throw new Error(data.message || `HTTP ${res.status}`);
    }
    return Array.isArray(data.data) ? data.data : [];
  };

  document.getElementById("searchBtn").addEventListener("click", async () => {
    const rawQ = document.getElementById("searchKey").value || "";
    const q = rawQ.trim();
    const minPrice = (document.getElementById("minPrice").value || "").trim();
    const maxPrice = (document.getElementById("maxPrice").value || "").trim();
    const sort = document.getElementById("sortOrder").value;

    if (!q && !minPrice && !maxPrice) {
      alert("⚠️ Vui lòng nhập ít nhất một điều kiện tìm kiếm!");
      return;
    }

    cakeList.innerHTML = "";
    introText.textContent = "🔍 Đang tìm kiếm...";

    try {
      // --- B1: tìm với tất cả tham số người dùng nhập ---
      let results = await callSearch(q, { minPrice, maxPrice, sort });

      // --- B2: nếu rỗng -> thử lại chỉ với từ khóa ---
      if (results.length === 0) {
        console.log("ℹ️ Fallback #1: chỉ dùng q");
        results = await callSearch(q, {});
      }

      // --- B3: nếu vẫn rỗng -> thử với q đã bỏ dấu ---
      if (results.length === 0) {
        const qNorm = normalizeVi(q);
        if (qNorm && qNorm !== q.toLowerCase().trim()) {
          console.log("ℹ️ Fallback #2: dùng q bỏ dấu:", qNorm);
          results = await callSearch(qNorm, {});
        }
      }

      if (results.length === 0) {
        introText.textContent = `🔎 Không tìm thấy bánh nào phù hợp với “${q}”.`;
        cakeList.innerHTML = "<p>Không có kết quả hiển thị.</p>";
        return;
      }

      introText.textContent = `🎂 Kết quả tìm kiếm (${results.length} bánh) cho “${q}”:`;
      renderCakes(results);
    } catch (err) {
      console.error("❌ Lỗi tìm kiếm:", err);
      alert("❌ Lỗi khi tìm kiếm: " + err.message);
    }
  });
}


  // ======================
  // TẠO BÁNH MỚI (CÓ ID TÙY NHẬP)
  // ======================
  async function showCreateForm() {
    introText.textContent = "➕ Tạo bánh mới:";

    let catList = [];
    try {
      const catData = await fetchJSON("https://banhngot.fitlhu.com/api/cakes/categories/list");
      catList = Array.isArray(catData.data) ? catData.data : Object.values(catData.data);
    } catch {
      catList = [];
    }

    const options = catList
      .map(
        (cat) =>
          `<option value="${cat.category || cat.name || Object.values(cat)[0]}">
            ${cat.category || cat.name || Object.values(cat)[0]}
          </option>`
      )
      .join("");

    formContainer.innerHTML = `
      <div class="form-card">
        <label>🆔 ID bánh (tùy chọn):</label>
        <input id="cakeId" placeholder="Nhập ID (tự đặt để dễ xóa hoặc sửa)" />

        <label>🎂 Tên bánh:</label>
        <input id="cakeName" placeholder="Tên bánh..." />

        <label>📦 Loại bánh:</label>
        <select id="cakeCategory">
          <option value="">-- Chọn loại bánh --</option>
          ${options}
        </select>

        <label>📝 Mô tả:</label>
        <textarea id="cakeDesc" placeholder="Mô tả ngắn..."></textarea>

        <label>🖼️ Ảnh:</label>
        <input id="cakeImage" placeholder="https://..." />

        <label>💰 Giá (VNĐ):</label>
        <input id="cakePrice" type="number" placeholder="Giá..." />

        <button id="createBtn">Tạo bánh</button>
      </div>
    `;

    document.getElementById("createBtn").addEventListener("click", async () => {
      const id = document.getElementById("cakeId").value.trim();
      const name = document.getElementById("cakeName").value.trim();
      const category = document.getElementById("cakeCategory").value.trim();
      const description = document.getElementById("cakeDesc").value.trim();
      const image = document.getElementById("cakeImage").value.trim();
      const price = Number(document.getElementById("cakePrice").value.trim());

      if (!name || !category || !price) {
        alert("⚠️ Vui lòng nhập đủ tên, loại bánh và giá tiền!");
        return;
      }

      const payload = { id, name, category, description, image, price };

      try {
        const data = await fetchJSON("https://banhngot.fitlhu.com/api/cakes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(payload),
        });

        alert(data.message || "🎉 Tạo bánh thành công!");
        await showMyCakes();
      } catch (err) {
        alert("❌ Không thể tạo bánh: " + err.message);
      }
    });
  }

  // ======================
  // CẬP NHẬT BÁNH
  // ======================
  function showUpdateForm() {
    introText.textContent = "✏️ Cập nhật bánh:";
    formContainer.innerHTML = `
      <div class="form-card">
        <label>ID bánh:</label>
        <input id="cakeId" placeholder="Nhập ID bánh..." />
        <label>Tên mới:</label>
        <input id="newName" placeholder="Tên mới..." />
        <label>Giá mới:</label>
        <input id="newPrice" type="number" placeholder="Giá mới..." />
        <label>Mô tả:</label>
        <textarea id="newDesc" placeholder="Mô tả mới..."></textarea>
        <button id="updateBtn">Cập nhật</button>
      </div>
    `;

    document.getElementById("updateBtn").addEventListener("click", async () => {
      const id = document.getElementById("cakeId").value.trim();
      if (!id) return alert("⚠️ Nhập ID bánh!");

      const name = document.getElementById("newName").value.trim();
      const desc = document.getElementById("newDesc").value.trim();
      const priceVal = document.getElementById("newPrice").value.trim();

      const payload = {};
      if (name) payload.name = name;
      if (desc) payload.description = desc;
      if (priceVal) payload.price = Number(priceVal);

      const data = await fetchJSON("https://banhngot.fitlhu.com/api/cakes/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      alert(data.message || "🎉 Cập nhật thành công!");
      await showMyCakes();
    });
  }

  // ======================
  // XÓA BÁNH
  // ======================
  function showDeleteForm() {
    introText.textContent = "🗑️ Xóa bánh:";
    formContainer.innerHTML = `
      <div class="form-card">
        <label>ID bánh cần xóa:</label>
        <input id="deleteId" placeholder="Nhập ID bánh..." />
        <button id="deleteBtn">Xóa bánh</button>
      </div>
    `;

    document.getElementById("deleteBtn").addEventListener("click", async () => {
      const id = document.getElementById("deleteId").value.trim();
      if (!id) return alert("⚠️ Nhập ID bánh!");
      if (!confirm("Bạn có chắc muốn xóa bánh này?")) return;

      const data = await fetchJSON("https://banhngot.fitlhu.com/api/cakes/" + id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });

      alert(data.message || "🎉 Đã xóa thành công!");
      await showMyCakes();
    });
  }

  // ======================
  // ĐĂNG XUẤT
  // ======================
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    alert("Đăng xuất thành công!");
    window.location.href = "index.html";
  });
});
