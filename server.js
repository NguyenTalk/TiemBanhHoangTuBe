const fs = require("fs");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = "./cakes.json"; // 🔹 file lưu bánh local

// Đọc bánh đã lưu (nếu có)
let localCakes = [];
if (fs.existsSync(DATA_FILE)) {
  localCakes = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

// 🧁 API lấy danh sách bánh
app.get("/cakes", async (req, res) => {
  try {
    const response = await fetch("https://banhngot.fitlhu.com/api/cakes");
    const data = await response.json();
    const allCakes = [...(data.data || []), ...localCakes];
    res.json({ data: allCakes });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// 🎂 API thêm bánh
app.post("/cakes", (req, res) => {
  const { name, description, image, price, author } = req.body; // thêm author
  if (!name || !description || !image || !price) {
    return res.status(400).json({ message: "Thiếu thông tin bánh!" });
  }

  const newCake = {
    id: Date.now(),
    name,
    description,
    image,
    price,
    author: author || "Ẩn danh 👻" // nếu không có thì để mặc định
  };

  localCakes.push(newCake);
  fs.writeFileSync(DATA_FILE, JSON.stringify(localCakes, null, 2));

  res.json({ message: "Thêm bánh thành công!", data: newCake });
});


app.listen(5000, () => console.log("✅ Server running at http://localhost:5000"));
