const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


// 🧁 Mảng lưu tạm các bánh người dùng thêm
let localCakes = [];

// 🔹 Lấy danh sách bánh (từ API ngoài + bánh tự thêm)
app.get("/cakes", async (req, res) => {
  try {
    const response = await fetch("https://banhngot.fitlhu.com/api/cakes");
    const data = await response.json();
    const allCakes = [...(data.data || []), ...localCakes];
    res.json({ data: allCakes });
  } catch (error) {
    console.error("Error fetching cakes:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/cakes", (req, res) => {
  const { name, description, image, price } = req.body;
  if (!name || !description || !image || !price) {
    return res.status(400).json({ message: "Thiếu thông tin bánh!" });
  }

  const newCake = { id: Date.now(), name, description, image, price };

  // 🧁 Lưu bánh vào mảng local
  localCakes.push(newCake);

  console.log("🎂 Bánh mới thêm:", newCake);
  res.json({ message: "Thêm bánh thành công!", data: newCake });
});


app.listen(5000, () => {
  console.log("✅ Server is running at http://localhost:5000");
});
